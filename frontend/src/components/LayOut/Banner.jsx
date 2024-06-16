//import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./Carousal.css";

function Banner() {
  return (
    <div className="relative max-w-full overflow-hidden shadow-lg h-[375px]">
      <Carousel
        autoPlay
        infiniteLoop
        showStatus={false}
        showIndicators={true}
        showThumbs={false}
        interval={2500}
      >
        <div className="relative h-full">
          <img
            loading="lazy"
            className="banner-img"
            src="https://res.cloudinary.com/daqh5tie1/image/upload/v1718359988/ghdzpwe774xnugsq3gjs.jpg"
            alt="Bisariyon"
          />
          <div className="banner-gradient"></div>
          <div className="banner-text">
            Welcome to our store
            <h2 className="banner-subtext">EarlyBird Sale Live Now!!</h2>
          </div>
        </div>
        <div className="relative h-full">
          <img
            loading="lazy"
            className="banner-img"
            src="https://res.cloudinary.com/daqh5tie1/image/upload/v1718359988/gv0z3xlbftnk8comqqsv.jpg"
            alt="Sale"
          />
          <div className="banner-gradient"></div>
          <div className="banner-text">
            New Arrivals Just for You
          </div>
        </div>
        <div className="relative h-full">
          <img
            loading="lazy"
            className="banner-img"
            src="https://res.cloudinary.com/daqh5tie1/image/upload/v1718359988/jeunvp3sfnrf4yreauwa.jpg"
            alt="Sale"
          />
          <div className="banner-gradient"></div>
          <div className="banner-text">
            Limited Time Offers
          </div>
        </div>
        <div className="relative h-full">
          <img
            loading="lazy"
            className="banner-img"
            src="https://res.cloudinary.com/daqh5tie1/image/upload/v1718359988/kg27lqxijyos45etnrkq.jpg"
            alt="Amazon Prime"
            style={{
              maskImage: "linear-gradient(to top, white 15%, white 85%)",
            }}
          />
          <div className="banner-gradient"></div>
          <div className="banner-text">
            Get Free Shipping
          </div>
        </div>
        <div className="relative h-full">
          <img
            loading="lazy"
            className="banner-img"
            src="https://res.cloudinary.com/daqh5tie1/image/upload/v1718359989/bkdjlmthtg5qxbeihqst.jpg"
            alt="Sale"
          />
          <div className="banner-gradient"></div>
          <div className="banner-text">
            Exclusive Discounts
          </div>
        </div>
      </Carousel>
    </div>
  );
}

export default Banner;