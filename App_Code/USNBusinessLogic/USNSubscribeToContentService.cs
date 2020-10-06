using System;
using System.Globalization;
using System.Linq;
using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Core.Events;
using Umbraco.Core.Models;
using Umbraco.Core.Persistence;
using Umbraco.Core.Services;
using Umbraco.Core.Services.Implement;
using USNStarterKit;

namespace USNWebsite.USNBusinessLogic
{
    public class USNSubscribeToContentService : IComponent
    {
        private readonly IContentService _contentService;
        private readonly ISqlContext _sqlContent;

        public USNSubscribeToContentService(IContentService contentService, ISqlContext sqlContent)
        {
            _contentService = contentService;
            _sqlContent = sqlContent;
        }

        // initialize: runs once when Umbraco starts
        public void Initialize()
        {
            ContentService.Trashing += ContentService_Trashing;
            ContentService.Saved += ContentService_Saved;
            ContentService.Published += ContentService_Published;
        }

        private void ContentService_Trashing(IContentService sender, MoveEventArgs<IContent> e)
        {
            foreach (var node in e.MoveInfoCollection)
            {
                if (node.Entity.HasProperty(USNConstants.GeneralDisableDeleteFieldAlias))
                {
                    IContent content = sender.GetById(node.Entity.Id);

                    if (content.HasProperty(USNConstants.GeneralDisableDeleteFieldAlias) && content.GetValue<bool>(USNConstants.GeneralDisableDeleteFieldAlias))
                    {
                        e.Cancel = true;
                        e.Messages.Add(new EventMessage("Deletion of this item has been blocked", "This item is important to the successfull operation of this website.<br>If you would still like to delete this item, please uncheck the 'Disable delete' field on the 'Properties' group.", EventMessageType.Warning));
                    }
                }
            }
        }

        private void ContentService_Saved(IContentService sender, ContentSavedEventArgs e)
        {
            foreach (var node in e.SavedEntities)
            {
                if (node.ContentType.Alias == USNConstants.HomePageAlias || node.ContentType.Alias == USNConstants.PageAlias || node.ContentType.Alias == USNConstants.BlogPostAlias)
                {
                    IContent pageComponentsNode = CreatePageComponentsFolder(node, false);

                    if (pageComponentsNode != null)
                        _contentService.Save(pageComponentsNode);

                }
                if (node.ContentType.Alias == USNConstants.BlogPostAlias)
                {
                    MoveBlogPostToCorrectFolder(node, e);
                }
            }
        }

        private void ContentService_Published(IContentService sender, ContentPublishedEventArgs e)
        {
            foreach (var node in e.PublishedEntities)
            {
                if (node.ContentType.Alias == USNConstants.HomePageAlias || node.ContentType.Alias == USNConstants.PageAlias || node.ContentType.Alias == USNConstants.BlogPostAlias)
                {
                    IContent pageComponentsNode = CreatePageComponentsFolder(node, true);
                    if (pageComponentsNode != null)
                        _contentService.SaveAndPublish(pageComponentsNode);
                }
            }
        }

        private IContent CreatePageComponentsFolder(IContent node, bool returnNode)
        {
            var filter = _sqlContent.Query<IContent>().Where(x => x.Name == "Components");
            long totalChildren;
            var pageComponentsNode = _contentService.GetPagedChildren(node.Id, 0, 1, out totalChildren, filter: filter).FirstOrDefault();

            if (pageComponentsNode == null)
            {
                var pageComponentsNodeNew = _contentService.CreateContent("Components", node.GetUdi(), USNConstants.PageComponentsFolderAlias);
                pageComponentsNodeNew.SetValue(USNConstants.GeneralDisableDeleteFieldAlias, true);

                return pageComponentsNodeNew;
            }
            else
                return returnNode ? pageComponentsNode : null;
        }

        private void MoveBlogPostToCorrectFolder(IContent node, ContentSavedEventArgs e)
        {
            int monthID = -1;
            IContent parentNode = _contentService.GetById(node.ParentId);
            DateTime postDate = DateTime.Parse(node.GetValue(USNConstants.BlogPostDateFieldAlias).ToString());

            //Check if post already in month folder
            if (parentNode.ContentType.Alias == USNConstants.BlogMonthFolderAlias)
            {
                IContent yearNode = _contentService.GetById(parentNode.ParentId);

                if (parentNode.GetValue<int>(USNConstants.BlogMonthFieldAlias) != postDate.Month || yearNode.GetValue<int>(USNConstants.BlogYearFieldAlias) != postDate.Year)
                {
                    IContent blogPostFolder = _contentService.GetById(yearNode.ParentId);
                    monthID = GetMonthNodeForBlogItem(blogPostFolder, postDate);
                }
            }
            else if (parentNode.ContentType.Alias == USNConstants.BlogPostsFolderAlias)
            {
                monthID = GetMonthNodeForBlogItem(parentNode, postDate);
            }
            else if (parentNode.ContentType.Alias == USNConstants.BlogLandingPageAlias)
            {
                var filter = _sqlContent.Query<IContent>().Where(x => x.Name == "Posts");
                long totalChildren;
                var blogPostsFolder = _contentService.GetPagedChildren(parentNode.Id, 0, 1, out totalChildren, filter: filter).FirstOrDefault();

                if (blogPostsFolder != null)
                {
                    monthID = GetMonthNodeForBlogItem(blogPostsFolder, postDate);
                }
            }

            if (monthID != -1)
                _contentService.Move(node, monthID);

        }

        private int GetMonthNodeForBlogItem(IContent blogPostFolder, DateTime postDate)
        {
            int monthID = -1;
            int pagesToRetrieve = 1;
            IContent yearFolder = null;
            IContent monthFolder = null;

            //Loop through paged children, 10 items per page at a time to check for correct year folder
            for (int pageIndex = 0; pageIndex < pagesToRetrieve; pageIndex++)
            {
                long totalChildren = 0;
                var allYearFolders = _contentService.GetPagedChildren(blogPostFolder.Id, pageIndex, 10, out totalChildren);
                yearFolder = allYearFolders != null ? allYearFolders.Where(x => x.GetValue<int>(USNConstants.BlogYearFieldAlias) == postDate.Year).FirstOrDefault() : null;

                if (yearFolder != null)
                    break;
                else if (yearFolder == null && totalChildren < 10)
                    break;
                else if (yearFolder == null && totalChildren == 10)
                {
                    //Need to get next page of children
                    pagesToRetrieve++;
                }
            }

            //Year folder found so search for month folder
            if (yearFolder != null)
            {
                //Only need to go through pages once as should only be a total of 12. If more there is an issue.
                long totalChildren = 0;
                var allMonthFolders = _contentService.GetPagedChildren(yearFolder.Id, 0, 12, out totalChildren);
                monthFolder = allMonthFolders != null ? allMonthFolders.Where(x => x.GetValue<int>(USNConstants.BlogMonthFieldAlias) == postDate.Month).FirstOrDefault() : null;

                if (monthFolder != null)
                    monthID = monthFolder.Id;
                else
                    monthID = CreateMonthFolder(yearFolder, postDate);
            }
            else
            {
                int yearID = CreateYearFolder(blogPostFolder, postDate);
                IContent yearNode = _contentService.GetById(yearID);
                monthID = CreateMonthFolder(yearNode, postDate);
            }

            return monthID;
        }

        private int CreateMonthFolder(IContent yearFolder, DateTime postDate)
        {
            var monthFolder = _contentService.CreateContent(postDate.ToString("MMMM", CultureInfo.CreateSpecificCulture("en")), yearFolder.GetUdi(), USNConstants.BlogMonthFolderAlias);
            monthFolder.SetValue(USNConstants.BlogMonthFieldAlias, postDate.Month.ToString());
            _contentService.SaveAndPublish(monthFolder);

            return monthFolder.Id;
        }

        private int CreateYearFolder(IContent blogPostFolder, DateTime postDate)
        {
            var yearFolder = _contentService.CreateContent(postDate.Year.ToString(), blogPostFolder.GetUdi(), USNConstants.BlogYearFolderAlias);
            yearFolder.SetValue(USNConstants.BlogYearFieldAlias, postDate.Year.ToString());
            _contentService.SaveAndPublish(yearFolder);

            return yearFolder.Id;
        }

        // terminate: runs once when Umbraco stops
        public void Terminate()
        {
        }
    }
}