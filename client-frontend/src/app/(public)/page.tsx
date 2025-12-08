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
    <>
      <section className="h-full grid grid-cols-1 md:grid-cols-2" >
        <div className="bg-background flex items-center justify-center text-3xl font-bold">
          Картинка
        </div>

        <div className="display flex items-center p-5" >
          <div className="flex flex-col gap-5 text-center md:text-left">
            <h3
              className="text-3xl md:text-4xl font-semibold leading-snug"
            >
              Создайте свой <RotatingText
                texts={heroTags}
                mainClassName='bg-secondary text-secondary-foreground px-2 pb-1 rounded-lg transition-all'
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                rotationInterval={2000}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                splitLevelClassName="overflow-hidden"
              /> интернет - магазин за минуту
            </h3>

            <BlurText
              delay={100}
              className="text-md md:text-lg justify-center md:justify-start"
              text="Мощная платформа для создания и управления вашим онлайн-бизнесом. Без технических знаний."
              direction="bottom"
              animationFrom={undefined}
              animationTo={undefined}
              onAnimationComplete={undefined}
            />

            <div>

              <Magnet padding={50} magnetStrength={3} >
                <Button className="text-secondary-foreground bg-secondary font-mono px-6 hover:opacity-90 hover:bg-secondary cursor-pointer">Создать свой сайт</Button>
              </Magnet>

            </div>
          </div>
        </div>

      </section>


    </>
  );
}
