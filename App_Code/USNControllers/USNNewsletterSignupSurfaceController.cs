using createsend_dotnet;
using MailChimp;
using MailChimp.Helper;
using MailChimp.Lists;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Net;
using System.Web;
using System.Web.Mvc;
using Umbraco.Web;
using USNStarterKit.USNHelpers;
using USNStarterKit.USNModels;
using USNWebsite.USNModels;

namespace USNWebsite.USNControllers
{
    public class USNNewsletterSignupSurfaceController : Umbraco.Web.Mvc.SurfaceController
    {
        public ActionResult Index(int GlobalSettingsID, string ViewPath, string DataSize, string FormColor, string FormButtonColor, USNHeading FormHeading,
            string FormSecondaryHeading, HtmlString FormIntroduction, string FormButtonText, string FormSubmissionMessage, string FormSubscriberListID, bool FormHideFields)
        {
            var model = new USNNewsletterFormViewModel();
            Guid g = Guid.NewGuid();
            model.UniqueID = Guid.NewGuid().ToString();
            model.GlobalSettingsID = GlobalSettingsID;
            model.CaptchaDataSize = DataSize;
            model.FormColor = FormColor;
            model.FormButtonColor = FormButtonColor;
            model.FormHeading = FormHeading;
            model.FormSecondaryHeading = FormSecondaryHeading;
            model.FormIntroduction = FormIntroduction;
            model.FormButtonText = FormButtonText;
            model.FormSubmissionMessage = FormSubmissionMessage;
            model.FormSubscriberListID = FormSubscriberListID;
            model.FormHideFields = FormHideFields;

            return PartialView(ViewPath + "/USNForms/USN_NewsletterSignup", model);
        }

        [HttpPost]
        public ActionResult HandleNewsletterSubmit(USNNewsletterFormViewModel model)
        {
            System.Threading.Thread.Sleep(1000);

            var globalSettings = Umbraco.Content(model.GlobalSettingsID);

            string recaptchaReset = globalSettings.HasValue("googleReCAPTCHASiteKey") && globalSettings.HasValue("googleReCAPTCHASecretKey") ? "grecaptcha.reset();" : String.Empty;

            string lsReturnValue = String.Empty;

            if (!ModelState.IsValid)
            {
                return JavaScript(String.Format("{0}$('#NE_{1}').show();$('#NE_{1}').html('<div class=\"info\"><p>{2}</p></div>');", recaptchaReset, model.UniqueID, HttpUtility.JavaScriptStringEncode(Umbraco.GetDictionaryValue("USN Form Required Field Error"))));
            }
            try
            {
                if (globalSettings.HasValue("googleReCAPTCHASiteKey") && globalSettings.HasValue("googleReCAPTCHASecretKey"))
                {
                    var response = Request["g-recaptcha-response"];
                    string secretKey = globalSettings.Value<string>("googleReCAPTCHASecretKey");
                    var client = new WebClient();
                    var result = client.DownloadString(string.Format("https://www.google.com/recaptcha/api/siteverify?secret={0}&response={1}", secretKey, response));
                    var obj = JObject.Parse(result);
                    var status = (bool)obj.SelectToken("success");

                    if (!status)
                    {
                        return JavaScript(String.Format("{0}$('#NE_{1}').show();$('#NE_{1}').html('{2}');", recaptchaReset, model.UniqueID, HttpUtility.JavaScriptStringEncode(Umbraco.GetDictionaryValue("USN Form reCAPTCHA Error"))));
                    }
                }

                string firstName = model.FirstName == "***" ? String.Empty : model.FirstName;
                string lastName = model.LastName == "***" ? String.Empty : model.LastName;

                if (globalSettings.Value<string>("emailMarketingPlatform") == "newsletterCM")
                {
                    AuthenticationDetails auth = new ApiKeyAuthenticationDetails(globalSettings.Value<string>("newsletterAPIKey"));

                    string subsciberListID = String.Empty;

                    if (model.FormSubscriberListID.HasValue())
                        subsciberListID = model.FormSubscriberListID;
                    else
                        subsciberListID = globalSettings.Value<string>("defaultNewsletterSubscriberListID");

                    Subscriber loSubscriber = new Subscriber(auth, subsciberListID);

                    List<SubscriberCustomField> customFields = new List<SubscriberCustomField>();

                    string subscriberID = loSubscriber.Add(model.Email, firstName + " " + lastName, customFields, false);
                }
                else if (globalSettings.Value<string>("emailMarketingPlatform") == "newsletterMC")
                {

                    var mc = new MailChimpManager(globalSettings.Value<string>("newsletterAPIKey"));

                    string subsciberListID = String.Empty;

                    if (model.FormSubscriberListID.HasValue())
                        subsciberListID = model.FormSubscriberListID;
                    else
                        subsciberListID = globalSettings.Value<string>("defaultNewsletterSubscriberListID");


                    var email = new EmailParameter()
                    {
                        Email = model.Email
                    };

                    var myMergeVars = new MergeVar();
                    myMergeVars.Add("FNAME", firstName);
                    myMergeVars.Add("LNAME", lastName);

                    EmailParameter results = mc.Subscribe(subsciberListID, email, myMergeVars, "html", false, true, false, false);
                }

                return JavaScript(String.Format("$('#S_{0}').show();$('#Form_{0}').hide();", model.UniqueID));
            }
            catch (Exception ex)
            {
                return JavaScript(String.Format("{0}$('#NE_{1}').show();$('#NE_{1}').html('<div class=\"info\"><p>{2}</p><p>{3}</p></div>');", recaptchaReset, model.UniqueID, HttpUtility.JavaScriptStringEncode(Umbraco.GetDictionaryValue("USN Newsletter Form Signup Error")), HttpUtility.JavaScriptStringEncode(ex.Message)));
            }
        }
    }
}