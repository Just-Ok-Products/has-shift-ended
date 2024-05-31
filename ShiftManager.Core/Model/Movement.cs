using ShiftManager.Core.Model.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShiftManager.Core.Model
{
    public class Movement
    {
        [Key]
        public DateTime Time { get; set; }
        public MovementType Type { get; set; }
        [Required]
        public User Actor { get; set; }
    }
}
