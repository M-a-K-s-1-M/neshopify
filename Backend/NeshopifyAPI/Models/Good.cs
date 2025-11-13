using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.CompilerServices;

namespace neshopify.Models
{
    /// <summary>
    /// Представляет товар, который принадлежит определённой категории и имеет цену, описание и название.
    /// </summary>
    public class Good
    {
        /// <summary>
        /// Уникальный идентификатор товара.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Название товара.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Подробное описание товара.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Цена товара в базовой валюте.
        /// </summary>
        public decimal Price { get; set; }

        /// <summary>
        /// Внешний ключ, указывающий на категорию, к которой относится товар.
        /// </summary>
        [ForeignKey(nameof(GoodsCategory))]
        public Guid GoodsCategoryId { get; set; }

        /// <summary>
        /// Категория, к которой относится данный товар.
        /// </summary>
        public GoodsCategory GoodsCategory { get; set; }
    }
}
