using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace neshopify.Models
{
    /// <summary>
    /// Представляет элемент корзины пользователя, содержащий информацию о выбранном товаре.
    /// </summary>
    public class BasketItem
    {
        /// <summary>
        /// Уникальный идентификатор элемента корзины.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Идентификатор связанного товара.
        /// </summary>
        [ForeignKey(nameof(GoodId))]
        public Guid GoodId { get; set; }

        /// <summary>
        /// Объект товара, связанный с данным элементом корзины.
        /// </summary>
        public Good Good { get; set; }

        /// <summary>
        /// Идентификатор пользователя, которому принадлежит товар.
        /// </summary>
        [ForeignKey(nameof(User))]
        public Guid UserId { get; set; } // Эльдару для авторизации нужна будет сущность User

        /// <summary>
        /// Пользователь, связанный с данным товаром в корзине.
        /// </summary>
        public User User { get; set; } // Эльдару для авторизации нужна будет сущность User

        /// <summary>
        /// Идентификтор корзины, которй принадлежит товар.
        /// </summary>
        [ForeignKey(nameof(Basket))]
        public Guid BasketId { get; set; }

        /// <summary>
        /// Корзина, которой принадлежит товар.
        /// </summary>
        public Basket Basket { get; set; }

        /// <summary>
        /// Количетсво товаров
        /// </summary>
        public int Count { get; set; } 
    }
}
