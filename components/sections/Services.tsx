import { DollarSignIcon, Truck, Users } from "lucide-react";

const Services = () => {
  return (
    <div className="mx-auto w-[90%] px-4 py-8">
      {/* Main Container - Responsive Grid: 1-col mobile, 2-col tablet, 4-col desktop */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Lightning-Fast Service */}
        <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-md transition-shadow duration-300 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Truck className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Lightning-Fast Service</h3>
          <p className="mb-2 text-sm text-gray-600">
            Your order delivered in under 90 mins anywhere in Abu Dhabi between 9am and 11:00pm 7
            days a week!
          </p>
          <p className="text-xs text-gray-500">(excluding western region)</p>
        </div>

        {/* Card 2: Spend more, save more */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-md transition-shadow duration-300 hover:shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <DollarSignIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Spend more, save more</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>Spend AED 300 get 5% discount</li>
            <li>Spend AED 450 get 10% discount</li>
            <li>Spend AED 750 get 15% discount</li>
          </ul>
        </div>

        {/* Card 3: Free Delivery */}
        <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-md transition-shadow duration-300 hover:shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Truck className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Free Delivery</h3>
          <p className="text-sm text-gray-600">
            Free delivery for orders over AED 100 (excluding certain areas)
          </p>
        </div>

        {/* Card 4: Refer a friend */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-md transition-shadow duration-300 hover:shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
            <Users className="h-6 w-6 text-pink-600" />
          </div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Refer a friend</h3>
          <p className="mb-2 text-sm text-gray-600">Refer your friends and get 30% off!</p>
          <a href="#" className="text-sm font-medium text-gray-400 underline hover:text-gray-500">
            Click here to learn more
          </a>
        </div>
      </div>
    </div>
  );
};

export default Services;
