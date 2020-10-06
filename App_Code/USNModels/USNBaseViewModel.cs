using Umbraco.Core.Models.PublishedContent;
using Umbraco.Web.Models;

namespace USNWebsite.USNModels
{
    /// <summary>
    /// Not using strongly typed models here so that PureLive mode can be used
    /// </summary>
    public class USNBaseViewModel : ContentModel
    {
        public USNBaseViewModel(IPublishedContent content) : base(content) { }

        public IPublishedContent HomeNode { get; set; }
        public IPublishedContent GlobalSettings { get; set; }

        public IPublishedContent Navigation { get; set; }

        public IPublishedContent Footer { get; set; }

        public IPublishedContent WebsiteStyle { get; set; }

        public string ViewPath { get; set; }
        public string CssPath { get; set; }
        public string ScriptPath { get; set; }
        public string ImagePath { get; set; }
        public int StyleID { get; set; }
    }
}