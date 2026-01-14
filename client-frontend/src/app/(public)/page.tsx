import { BlurText, Magnet, RotatingText } from "@/components/index";
import { Button } from "@/components/ui/button";
import { WelcomePreviewImage } from "@/components/public/welcome-preview-image";
import Link from "next/link";

const heroTags = [
  "быстрый",
  "надежный",
  "удобный",
  "эффективный",
];

export default function Welcome() {
  return (
    <>
      <section className="h-full w-full overflow-hidden grid grid-cols-1 md:grid-cols-2 items-stretch" >
        <div className="hidden md:block bg-background h-full w-full overflow-hidden p-0 m-0">
          <WelcomePreviewImage />
        </div>

        <div className="display flex items-center justify-center p-5" >
          <div className="flex flex-col gap-5 justify-center md:text-left max-w-lg ">
            <h3
              className="text-3xl md:text-4xl text-center font-semibold leading-snug"
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
              className="text-md md:text-lg flex justify-center md:text-left"
              text="Мощная платформа для создания и управления вашим онлайн-бизнесом. Без технических знаний."
              direction="bottom"
              animationFrom={undefined}
              animationTo={undefined}
              onAnimationComplete={undefined}
            />

            <div className="text-center">
              <Magnet padding={50} magnetStrength={3} >
                <Button className="text-secondary-foreground bg-secondary font-mono px-6 hover:opacity-90 hover:bg-secondary cursor-pointer" asChild>
                  <Link href={'sites'}>
                    Создать свой сайт
                  </Link>
                </Button>
              </Magnet>
            </div>

          </div>
        </div>

      </section>


    </>
  );
}
