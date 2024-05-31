using ShiftManager.Core.Model.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShiftManager.Core.Model.DTO
{
    public class MovementDTO
    {
        public DateTime Time { get; set; }
        public MovementType Type { get; set; }
        public UserDTO Actor { get; set; }
    }
}
