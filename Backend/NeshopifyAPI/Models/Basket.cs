using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace neshopify.Models
{
    /// <summary>
    /// Представляет корзину пользователя, содержащую выбранные товары.
    /// </summary>
    public class Basket
    {
        /// <summary>
        /// Уникальный идентификатор корзины.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Идентификатор пользователя, которому принадлежит корзина.
        /// </summary>
        [ForeignKey(nameof(User))] 
        public Guid UserId { get; set; } // Эльдару для авторизации нужна будет сущность User
         
        /// <summary>
        /// Пользователь, связанный с данной корзиной.
        /// </summary>
        public User User { get; set; } // Эльдару для авторизации нужна будет сущность User

        /// <summary>
        /// Список элементов корзины, не сохраняется напрямую в базе данных.
        /// </summary>
        [NotMapped]
        public List<BasketItem> BasketItems { get; set; }
    }
}
