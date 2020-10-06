using System.Linq;
using System.Web.Mvc;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Web;
using Umbraco.Web.Models;
using USNWebsite.USNModels;

namespace USNWebsite.USNControllers
{
    public class USNBaseController : Umbraco.Web.Mvc.RenderMvcController
    {
        public override ActionResult Index(ContentModel model)
        {
            IPublishedContent homeNode = model.Content.AncestorOrSelf(1);
            USNBaseViewModel customModel = new USNBaseViewModel(model.Content);

            if (homeNode.IsDocumentType("USNHomepage"))
            {
                IPublishedContent globalSettings = homeNode.Value<IPublishedContent>("websiteConfigurationNode").Children.Where(x => x.IsDocumentType("USNGlobalSettings")).FirstOrDefault();
                IPublishedContent navigation = homeNode.Value<IPublishedContent>("websiteConfigurationNode").Children.Where(x => x.IsDocumentType("USNNavigation")).FirstOrDefault();
                IPublishedContent footer = homeNode.Value<IPublishedContent>("websiteConfigurationNode").Children.Where(x => x.IsDocumentType("USNFooter")).FirstOrDefault();
                IPublishedContent websiteStyle = model.Content.HasValue("overrideWebsiteStyle") ? model.Content.Value<IPublishedContent>("overrideWebsiteStyle") : globalSettings.Value<IPublishedContent>("websiteStyle");

                customModel.HomeNode = homeNode;
                customModel.GlobalSettings = globalSettings;
                customModel.Navigation = navigation;
                customModel.Footer = footer;
                customModel.WebsiteStyle = websiteStyle;

                //Get Selected Style
                var selectedStyle = model.Content.HasValue("overrideWebsiteStyle") ? model.Content.Value<IPublishedContent>("overrideWebsiteStyle") : globalSettings.Value<IPublishedContent>("websiteStyle");
                string themeName = selectedStyle.Value<string>("selectTheme").ToLower().Trim().Replace(" ","_");
                customModel.ViewPath = "usn_" + themeName;
                customModel.ScriptPath = "/scripts/usn_" + themeName;
                customModel.CssPath = "/css/usn_" + themeName;
                customModel.ImagePath = "/images/usn_" + themeName;
                customModel.StyleID = selectedStyle.Id;

                return base.Index(customModel);
            }

            return base.Index(customModel);
        }

    }
}