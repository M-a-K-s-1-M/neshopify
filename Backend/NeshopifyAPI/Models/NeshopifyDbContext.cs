using Microsoft.EntityFrameworkCore;

namespace neshopify.Models
{
    public class NeshopifyDbContext : DbContext
    {
        public NeshopifyDbContext(DbContextOptions<NeshopifyDbContext> options)
            : base(options)
        {
        }

        public DbSet<Good> Goods { get; set; }
        public DbSet<GoodsCategory> GoodsCategories { get; set; }
    }
}