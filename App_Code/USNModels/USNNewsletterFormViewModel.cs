using System.ComponentModel.DataAnnotations;
using System.Web;
using USNStarterKit.USNModels;

namespace USNWebsite.USNModels
{
    public class USNNewsletterFormViewModel
    {
        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        [RegularExpression(@"\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*")]
        public string Email { get; set; }

        public string UniqueID { get; set; }

        public int GlobalSettingsID { get; set; }

        public string CaptchaDataSize { get; set; }

        public string FormColor { get; set; }

        public string FormButtonColor { get; set; }

        public USNHeading FormHeading { get; set; }
       
        public string FormSecondaryHeading { get; set; }

        public HtmlString FormIntroduction { get; set; }

        public string FormButtonText { get; set; }

        public string FormSubmissionMessage { get; set; }

        public string FormSubscriberListID { get; set; }

        public bool FormHideFields { get; set; }
    }
}