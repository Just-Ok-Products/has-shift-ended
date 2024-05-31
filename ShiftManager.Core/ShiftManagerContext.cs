using Microsoft.EntityFrameworkCore;
using ShiftManager.Core.Model;
using System.Data;

namespace ShiftManager.API
{
    public class ShiftManagerContext: DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Movement> Movements { get; set; }

        public ShiftManagerContext(DbContextOptions options) : base(options)
        {

        }
    }

}