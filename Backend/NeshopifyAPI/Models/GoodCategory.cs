using System;

namespace neshopify.Models
{
    /// <summary>
    /// Представляет категорию товаров в магазине.
    /// </summary>
    public class GoodsCategory
    {
        /// <summary>
        /// Уникальный идентификатор категории.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Название категории товаров.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Описание категории.
        /// </summary>
        public string Description { get; set; }
    }
}
