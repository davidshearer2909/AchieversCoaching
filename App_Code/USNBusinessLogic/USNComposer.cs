using System.Web.Routing;
using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Core.Mapping;
using Umbraco.Web.Runtime;

namespace USNWebsite.USNBusinessLogic
{
    /// <summary>
    /// Code from here: https://our.umbraco.com/forum/umbraco-8/98388-custom-routes-break-umbraco-backoffice
    /// </summary>
    [ComposeAfter(typeof(WebFinalComposer))]
    public class USNComposer : IComposer
    {
        public void Compose(Composition composition)
        {
            composition.Components().Append<RegisterStyleSheetRouteComponent>();
        }
    }

    public class RegisterStyleSheetRouteComponent : IComponent
    {

        // initialize: runs once when Umbraco starts
        public void Initialize()
        {
            RouteTable.Routes.Add("uSkinnedThemeStyle", new Route("style.axd", new USNStarterKit.USNBusinessLogic.ThemeRouteHandler()));
        }

        // terminate: runs once when Umbraco stops
        public void Terminate()
        {
        }
    }
}