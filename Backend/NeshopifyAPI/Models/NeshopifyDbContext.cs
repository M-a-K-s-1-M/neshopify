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
        public DbSet<Basket> Baskets { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<BasketItem> BasketItems { get; set; }  
        public DbSet<GoodsCategory> GoodsCategories { get; set; }
    }
}