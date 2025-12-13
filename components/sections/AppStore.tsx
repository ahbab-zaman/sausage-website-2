import Image from "next/image";
import appStore from "@/public/app-store-full.png";
import googleStore from "@/public/gplay-store-full.png";
import mobile from "@/public/app-device.png";

export const AppStore = () => {
  return (
    <section className="py-24">
      <div className="w-[65rem] mx-auto px-4">
        <div className="h-[300px] rounded-2xl bg-[#3b3b3b]">
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
            {" "}
            {/* Added items-stretch here */}
            {/* LEFT CONTENT */}
            <div className="px-8 py-16 text-white lg:px-16">
              <h1 className="mb-4 text-3xl font-bold lg:text-4xl">The Bottle Store</h1>

              <p className="mb-8 max-w-md text-gray-200">
                Ready to take your shopping to the next level? Download our app!
              </p>

              <div className="flex gap-4">
                <a
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
                </a>

                <a
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
                </a>
              </div>
            </div>
            {/* RIGHT IMAGE */}
            <div className="r-0 relative -top-[99px] left-[124px] flex h-[450px] w-full justify-end pr-8 lg:pr-16">
              <Image src={mobile} alt="App preview" fill className="object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
