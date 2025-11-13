using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Swashbuckle.AspNetCore.Annotations;
using neshopify.Models;

namespace neshopify.Controllers
{
    [ApiController]
    [Route("api/v1/goods")]
    public class GoodsController : ControllerBase
    {
        private readonly NeshopifyDbContext _dbContext;

        public GoodsController(NeshopifyDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("{id}")]
        [SwaggerOperation("Получение товара по идентификатору")]
        public async Task<ActionResult<Good>> GetById(Guid id)
        {
            var good = await _dbContext.Goods
                                       .Include(g => g.GoodsCategory)
                                       .FirstOrDefaultAsync(g => g.Id == id);

            if (good == null)
                return NotFound();

            return Ok(good);
        }

        [HttpGet]
        [SwaggerOperation("Получение списка всех товаров")]
        public async Task<ActionResult<IEnumerable<Good>>> GetAll()
        {
            var goods = await _dbContext.Goods
                                        .Include(g => g.GoodsCategory)
                                        .ToListAsync();

            return Ok(goods);
        }

        [HttpPost]
        [SwaggerOperation("Создание нового товара")]
        public async Task<ActionResult<Good>> Create([FromBody] Good good)
        {
            good.Id = Guid.NewGuid();
            _dbContext.Goods.Add(good);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = good.Id }, good);
        }

        [HttpPatch]
        [SwaggerOperation("Обновление существующего товара по ID")]
        public async Task<IActionResult> Update([FromBody] Good good)
        {
            var existing = await _dbContext.Goods.FirstOrDefaultAsync(g => g.Id == good.Id);
            if (existing == null)
                return NotFound();

            existing.Name = good.Name;
            existing.Description = good.Description;
            existing.Price = good.Price;
            existing.GoodsCategoryId = good.GoodsCategoryId;

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [SwaggerOperation("Удаление товара по идентификатору")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var good = await _dbContext.Goods.FirstOrDefaultAsync(g => g.Id == id);
            if (good == null)
                return NotFound();

            _dbContext.Goods.Remove(good);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}
