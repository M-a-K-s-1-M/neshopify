namespace neshopify.Models.DTOs
{
    public class BasketItemOutputModel // Поправить если нужно будет для фронта
    {
        /// <summary>
        /// BasketItemId
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Id товара 
        /// </summary>
        public Guid GoodId { get; set; }   

        /// <summary>
        /// Количество
        /// </summary>
        public int Count { get; set; }  
    }
}
