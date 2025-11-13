using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using neshopify.Models;
using neshopify.Models.DTOs;
using Swashbuckle.AspNetCore.Annotations;
using System;
using System.Threading.Tasks;

namespace neshopify.Controllers
{
    [ApiController]
    [Route("api/v1/me/basket-items")]
    public class BasketItemController : ControllerBase
    {
        private readonly NeshopifyDbContext _context;

        public BasketItemController(NeshopifyDbContext context)
        {
            _context = context;
        }

        [HttpPost("good/{goodId}/basket/{basketId}")]
        [SwaggerOperation("Добавить товар в корзину. Создаёт новый элемент и возвращает Id, GoodId, Count.")]
        public async Task<ActionResult<BasketItemOutputModel>> AddBasketItem(Guid goodId, Guid basketId, [FromBody] int count) // В файле не было что мы его передаем, но как мы иначе поймем в какую корзину положить то его 
        {
            var basketItem = new BasketItem
            {
                Id = Guid.NewGuid(),
                GoodId = goodId,
                BasketId = basketId, 
                // UserId = userId, // получать из авторизации  
                Count = count
            };

            _context.BasketItems.Add(basketItem);
            await _context.SaveChangesAsync();

            return new BasketItemOutputModel() { Id  = basketItem.Id, GoodId = goodId, Count = count };
        }

        [HttpGet("{id}/basket/{basketId}")]
        [SwaggerOperation("Получить элемент корзины по Id. Возвращает Id, GoodId и Count.")]
        public async Task<ActionResult<object>> GetBasketItem(Guid id, Guid basketId)
        {
            var basketItem = await _context.BasketItems.FirstOrDefaultAsync(x => x.Id == id && x.BasketId == basketId);
            if (basketItem == null) return NotFound();

            return new BasketItemOutputModel()
            {
                Id = basketItem.Id,
                GoodId = basketItem.GoodId,
                Count = basketItem.Count
            };
        }

        [HttpDelete("{id}/basket/{basketId}")]
        [SwaggerOperation("Удалить элемент корзины по Id.")]
        public async Task<IActionResult> DeleteBasketItem(Guid id, Guid basketId)
        {
            var basketItem = await _context.BasketItems.FirstOrDefaultAsync(x => x.Id == id && x.BasketId == basketId);
            if (basketItem == null) return NotFound();

            _context.BasketItems.Remove(basketItem);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id}/basket/{basketId}")]
        [SwaggerOperation("Обновить элемент корзины по Id. Изменяет поле Count.")]
        public async Task<ActionResult<object>> UpdateBasketItem(Guid id, Guid basketId, int count)
        {
            var basketItem = await _context.BasketItems.FirstOrDefaultAsync(x => x.Id == id && x.BasketId == basketId);
            if (basketItem == null) return NotFound();

            basketItem.Count = count;
            await _context.SaveChangesAsync();

            return new BasketItemOutputModel()
            {
                Id = basketItem.Id,
                GoodId = basketItem.GoodId,
                Count = basketItem.Count
            };
        }
    }
}
