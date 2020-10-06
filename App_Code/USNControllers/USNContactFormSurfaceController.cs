using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI.WebControls;
using USNWebsite.USNModels;
using Umbraco.Web;
using System.Web.Mvc;
using MailChimp.Helper;
using System.Net;
using MailChimp.Lists;
using createsend_dotnet;
using MailChimp;
using Newtonsoft.Json.Linq;
using USNStarterKit.USNModels;
using USNStarterKit.USNHelpers;

namespace USNWebsite.USNControllers
{
    /// <summary>
    /// Not using strongly typed models here so that PureLive mode can be used
    /// </summary>
    public class USNContactFormSurfaceController : Umbraco.Web.Mvc.SurfaceController
    {
        public ActionResult Index(int GlobalSettingsID, string ViewPath, string DataSize, string FormColor, string FormButtonColor, USNHeading FormHeading,
            string FormSecondaryHeading, HtmlString FormIntroduction, string FormButtonText, string FormSubmissionMessage, string FormSubscriberListID, string ContactRecipientEmailAddress, string PageName)
        {
            var model = new USNContactFormViewModel();
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
            model.ContactRecipientEmailAddress = ContactRecipientEmailAddress;
            model.PageName = PageName;

            return PartialView(ViewPath + "/USNForms/USN_ContactForm", model);
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult HandleContactSubmit(USNContactFormViewModel model)
        {
            System.Threading.Thread.Sleep(1000);

            //Need to get NodeID from hidden field. CurrentPage does not work with Ajax.BeginForm
            var globalSettings = Umbraco.Content(model.GlobalSettingsID);

            string returnValue = String.Empty;
            string recaptchaReset = globalSettings.HasValue("googleReCAPTCHASiteKey") && globalSettings.HasValue("googleReCAPTCHASecretKey") ? "grecaptcha.reset();" : String.Empty;

            if (!ModelState.IsValid)
            {
                return JavaScript(String.Format("{0}$('#CE_{1}').show();$('#CE_{1}').html('{2}');", recaptchaReset, model.UniqueID, HttpUtility.JavaScriptStringEncode(Umbraco.GetDictionaryValue("USN Form Required Field Error"))));
            }

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
                    return JavaScript(String.Format("{0}$('#CE_{1}').show();$('#CE_{1}').html('{2}');", recaptchaReset, model.UniqueID, HttpUtility.JavaScriptStringEncode(Umbraco.GetDictionaryValue("USN Form reCAPTCHA Error"))));
                }
            }

            string mailTo = StringCipher.Decrypt(model.ContactRecipientEmailAddress);
            string websiteName = globalSettings.Value<string>("websiteName");
            string pageName = model.PageName;

            string errorMessage = String.Empty;

            if (!SendContactFormMail(model, mailTo, websiteName, pageName, out errorMessage))
            {
                return JavaScript(String.Format("{0}$('#CE_{1}').show();$('#CE_{1}').html('<div class=\"info\"><p>{2}</p><p>{3}</p></div>');", recaptchaReset, model.UniqueID, HttpUtility.JavaScriptStringEncode(Umbraco.GetDictionaryValue("USN Form Mail Send Error")), HttpUtility.JavaScriptStringEncode(errorMessage)));
            }

            try
            {
                if (model.NewsletterSignup && globalSettings.HasValue("newsletterAPIKey") &&
                    (globalSettings.HasValue("defaultNewsletterSubscriberListID") || model.FormSubscriberListID.HasValue()))
                {
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

                        string subscriberID = loSubscriber.Add(model.Email, model.FirstName + " " + model.LastName, customFields, false);
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
                        myMergeVars.Add("FNAME", model.FirstName);
                        myMergeVars.Add("LNAME", model.LastName);

                        EmailParameter results = mc.Subscribe(subsciberListID, email, myMergeVars, "html", false, true, false, false);
                    }
                }

                return JavaScript(String.Format("$('#S_{0}').show();$('#Form_{0}').hide();", model.UniqueID));
            }
            catch (Exception ex)
            {
                return JavaScript(String.Format("{0}$('#CE_{1}').show();$('#CE_{1}').html('<div class=\"info\"><p>{2}</p><p>{3}</p></div>');", recaptchaReset, model.UniqueID, HttpUtility.JavaScriptStringEncode(Umbraco.GetDictionaryValue("USN Contact Form Signup Error")), HttpUtility.JavaScriptStringEncode(ex.Message)));
            }
        }

        public static bool SendContactFormMail(USNContactFormViewModel model, string mailTo, string websiteName, string pageName, out string lsErrorMessage)
        {
            lsErrorMessage = String.Empty;

            try
            {
                //Create MailDefinition 
                MailDefinition md = new MailDefinition();
                string lsSendTo = String.Empty;

                //specify the location of template 
                md.BodyFileName = "/usn/emailtemplates/contactform.html";
                md.IsBodyHtml = true;

                //Build replacement collection to replace fields in template 
                System.Collections.Specialized.ListDictionary replacements = new System.Collections.Specialized.ListDictionary();
                replacements.Add("<% formFirstName %>", model.FirstName == null ? "" : model.FirstName);
                replacements.Add("<% formLastName %>", model.LastName == null ? "" : model.LastName);
                replacements.Add("<% formEmail %>", model.Email == null ? "" : model.Email);
                replacements.Add("<% formPhone %>", model.Telephone == null ? "" : model.Telephone);
                replacements.Add("<% formMessage %>", model.Message == null ? "" : model.Message.Replace("\r\n", @"<br />").Replace("\n", @"<br />").Replace("\r", @"<br />"));
                replacements.Add("<% WebsitePage %>", pageName);
                replacements.Add("<% WebsiteName %>", websiteName);

                lsSendTo = mailTo;

                //now create mail message using the mail definition object 
                System.Net.Mail.MailMessage msg = md.CreateMailMessage(lsSendTo, replacements, new System.Web.UI.Control());
                msg.ReplyToList.Add(model.Email);
                msg.Subject = websiteName + " Website: " + pageName + " Page Enquiry";

                //this uses SmtpClient in 2.0 to send email, this can be configured in web.config file.
                System.Net.Mail.SmtpClient smtp = new System.Net.Mail.SmtpClient();
                smtp.Send(msg);

                return true;
            }
            catch (Exception ex)
            {
                lsErrorMessage = ex.Message;
            }

            return false;
        }
    }
}