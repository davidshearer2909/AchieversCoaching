using Examine;
using System;
using System.Globalization;
using System.Linq;
using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Web;
using USNWebsite.USNControllers;
using Umbraco.Core.Models.Sections;
using Umbraco.Web.Sections;

namespace USNWebsite.USNBusinessLogic
{
    public class USNUserComposer : IUserComposer
    {
        public void Compose(Composition composition)
        {
            composition.SetDefaultRenderMvcController<USNBaseController>();
            composition.Components().Append<USNExamineEvents>();
            composition.Components().Append<USNSubscribeToContentService>();
            composition.Sections().Append<USNSection>();
            composition.Sections().InsertBefore<PackagesSection, USNSection>();
        }
    }
}