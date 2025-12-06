import { BlurText, Magnet, RotatingText } from "@/components/index";
import { Button } from "@/components/ui/button";

const heroTags = [
  "быстрый",
  "надежный",
  "удобный",
  "эффективный",
];

export default function Welcome() {
  return (
    <section className="h-full grid grid-cols-1 md:grid-cols-2" >
      <div className="bg-neutral-50 text-black flex items-center justify-center text-3xl font-bold">
        Картинка
      </div>

      <div className="bg-neutral-800 display flex items-center p-5" >
        <div className="flex flex-col gap-5 text-center md:text-left">
          <h3
            className="text-3xl md:text-4xl font-semibold"
          >
            Создайте свой <RotatingText
              texts={heroTags}
              mainClassName='bg-emerald-200 text-neutral-800 px-2 pb-1 rounded-lg transition-all'
              staggerDuration={0.025}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              rotationInterval={2000}
            /> интернет - магазин за минуту
          </h3>

          <BlurText
            delay={100}
            className="text-md md:text-lg justify-center md:justify-start"
            text="Мощная платформа для создания и управления вашим онлайн-бизнесом. Без технических знаний."
            direction="bottom"
          />
          {/* <p className="text-lg">Мощная платформа для создания и управления вашим онлайн-бизнесом. Без технических знаний.</p> */}

          <div>

            <Magnet padding={50} magnetStrength={3} >
              <Button className="bg-emerald-200 font-mono px-6 hover:opacity-90 hover:bg-emerald-200 cursor-pointer">Создать свой сайт</Button>
            </Magnet>

          </div>
        </div>
      </div>

    </section>
  );
}
