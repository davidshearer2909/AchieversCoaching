using System.ComponentModel.DataAnnotations;

namespace USNWebsite.USNModels
{
    public class USNLoginFormViewModel
    {
        [Required]
        public string Username { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        public string ReturnUrl { get; set; }
    }
}