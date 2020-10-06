using Examine;
using Examine.Providers;
using System;
using System.Text;
using Umbraco.Web;
using USNStarterKit.USNHelpers;
using Umbraco.Core.Composing;
using USNStarterKit;

namespace USNWebsite.USNBusinessLogic
{
    public class USNExamineEvents : IComponent
    {
        private readonly IExamineManager _examineManager;
        private readonly IUmbracoContextFactory _umbracoContextFactory;

        public USNExamineEvents(IExamineManager examineManager, IUmbracoContextFactory umbracoContextFactory)
        {
            _examineManager = examineManager ?? throw new ArgumentNullException(nameof(examineManager));
            _umbracoContextFactory = umbracoContextFactory ?? throw new ArgumentNullException(nameof(umbracoContextFactory));
        }

        public void Initialize()
        {
            if (!_examineManager.TryGetIndex("ExternalIndex", out IIndex index))
                throw new InvalidOperationException("No index found by name ExternalIndex");

            //we need to cast because BaseIndexProvider contains the TransformingIndexValues event
            if (!(index is BaseIndexProvider indexProvider))
                throw new InvalidOperationException("Could not cast");

            indexProvider.TransformingIndexValues += IndexProviderTransformingIndexValues;
        }

        private void IndexProviderTransformingIndexValues(object sender, IndexingItemEventArgs e)
        {
            if (e.ValueSet.Category == "content")
            {
                e.ValueSet.TryAdd("searchablePath", e.ValueSet.GetValue("path").ToString().Replace(",", " "));

                var combinedFields = new StringBuilder();

                foreach (var fieldValues in e.ValueSet.Values)
                {
                    foreach (var value in fieldValues.Value)
                    {
                        if (value != null)
                        {
                            combinedFields.AppendLine(value.ToString());
                        }
                    }
                }

                e.ValueSet.TryAdd("combinedField", combinedFields.ToString());

                if (e.ValueSet.ItemType == USNConstants.BlogPostAlias)
                {
                    // add path
                    e.ValueSet.TryAdd(USNConstants.BlogSearchablePath, e.ValueSet.GetValue("path").ToString().Replace(",", " "));

                    // get the news item date
                    var postDate = ExamineIndexHelper.GetValueFromFieldOrProperty(e, USNConstants.BlogSearchableDate, USNConstants.BlogPostDateFieldAlias, _umbracoContextFactory);

                    // date
                    e.ValueSet.TryAdd(USNConstants.BlogSearchableDate, DateTime.Parse(postDate).Ticks);

                    // year
                    e.ValueSet.TryAdd(USNConstants.BlogSearchableDate_Year, DateTime.Parse(postDate).Year.ToString());

                    // month
                    e.ValueSet.TryAdd(USNConstants.BlogSearchableDate_Month, DateTime.Parse(postDate).Month.ToString());

                    // day
                    e.ValueSet.TryAdd(USNConstants.BlogSearchableDate_Day, DateTime.Parse(postDate).Day.ToString());

                    // categories
                    ExamineIndexHelper.AddIdsFromCsvUdiProperty(e, USNConstants.BlogSearchableCategoryIds, USNConstants.BlogCategoryFieldAlias, _umbracoContextFactory);

                }
            }
        }

        // terminate: runs once when Umbraco stops
        public void Terminate()
        {
        }
    }
}