import Image from "next/image";
import appStore from "@/public/app-store-full.png";
import googleStore from "@/public/gplay-store-full.png";
import mobile from "@/public/app-device.png";
import Link from "next/link";

export const AppStore = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative rounded-2xl bg-[#3b3b3b]">
          <div className="grid lg:grid-cols-2 grid-cols-1 lg:h-[300px] h-auto">
            {/* LEFT CONTENT */}
            <div className="px-6 py-10 text-white sm:px-10 lg:py-12">
              <h1 className="mb-4 text-2xl font-bold sm:text-3xl lg:text-4xl">The Bottle Store</h1>

              <p className="mb-8 max-w-md text-sm text-gray-200 sm:text-base">
                Ready to take your shopping to the next level? Download our app!
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="https://apps.apple.com/bh/app/the-bottle-store/id6447305367"
                  target="_blank"
                  rel="noopener noreferrer">
                  <Image
                    src={appStore}
                    alt="Download on App Store"
                    width={180}
                    height={54}
                    className="transition hover:scale-105"
                  />
                </Link>

                <Link
                  href="https://play.google.com/store/apps/details?id=com.bottleStore"
                  target="_blank"
                  rel="noopener noreferrer">
                  <Image
                    src={googleStore}
                    alt="Get it on Google Play"
                    width={180}
                    height={54}
                    className="transition hover:scale-105"
                  />
                </Link>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative flex h-[260px] justify-center sm:h-[320px] lg:-top-[90px] lg:left-[124px] lg:h-[450px] lg:justify-end lg:pr-16">
              <Image src={mobile} alt="App preview" fill className="object-contain" priority />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
