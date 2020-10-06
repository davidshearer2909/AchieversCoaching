using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Umbraco.Core.Models.PublishedContent;
using USNWebsite.USNModels;
using Umbraco.Web;

namespace USNWebsite.USNControllers
{
    public class USNLoginFormSurfaceController : Umbraco.Web.Mvc.SurfaceController
    {
        public ActionResult Index(string ViewPath)
        {
            var model = new USNLoginFormViewModel();

            if (CurrentPage.Url != Request.Url.PathAndQuery)
                model.ReturnUrl = Request.Url.PathAndQuery;
            else
                model.ReturnUrl = CurrentPage.Value<IPublishedContent>("loginSuccessPage").Url;

            return PartialView(ViewPath + "/USNForms/USN_LoginForm", model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult HandleLoginSubmit(USNLoginFormViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return CurrentUmbracoPage();
            }

            // Login
            if (Membership.ValidateUser(model.Username, model.Password))
            {
                FormsAuthentication.SetAuthCookie(model.Username, false);

                return Redirect(model.ReturnUrl);
            }
            else
            {
                TempData.Add("LoginFailure", Umbraco.GetDictionaryValue("USN Login Form Login Error"));
                return RedirectToCurrentUmbracoPage();
            }
        }
    }
}