import React, {useRef} from 'react';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {Await, Link} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

//@ts-ignore
export const Hero = ({products}) => {
  const scalesRef = useRef([]);

  const BASE_WIDTH = 300; // Base width in pixels

  //@ts-ignore
  const getRandomPosition = (max) => Math.random() * max; // Helper to get random position within a range

  useGSAP(() => {
    if (typeof document !== 'undefined') {
      console.log(document);
      gsap.registerPlugin(useGSAP, ScrollTrigger);
    }
    const ctx = gsap.context((self) => {
      let mm = gsap.matchMedia();
      const products = gsap.utils.toArray('.recommended-product');
      const container = document.querySelector('.index-container');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.hero-products-container',
          start: 'top top',
          scrub: true,
          end: '+=8000px',
          pin: true,
          markers: true,
          endTrigger: '.hero-products-inner-container',
        },
      });

      products.forEach((pd, index) => {
        const containerWidth = container?.clientWidth || window.innerWidth;
        const spacing = containerWidth / (products.length + 1);

        const randomX = getRandomPosition(containerWidth - BASE_WIDTH);
        const randomY = getRandomPosition(window.innerHeight - BASE_WIDTH);

        //@ts-ignore
        gsap.set(pd, {
          zIndex: products.length - index,
          position: 'absolute',
          x: randomX,
          y: randomY,
          scale: scalesRef.current[index],
        });

        tl.fromTo(
          //@ts-ignore
          pd,
          {y: window.innerHeight, ease: 'power1.inOut', scrub: 2},
          {
            y: randomY,
            x: randomX,
            ease: 'power1.in',
            duration: 0.5, // Duration per image
            stagger: 0.5, // Delay between animations for each image
            invalidateOnRefresh: true,
          },
          `-=${0.3 * index}`,
        );
      });
    });

    return () => ctx.revert();
  });

  // Generate random scales between 0.7 and 1 for subtler size differences
  const getRandomScale = () => Math.random() * (1 - 0.7) + 0.7;

  return (
    <div className="hero-products-container">
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="hero-products-inner-container">
              <h4 className="absolute inset-0 items-center justify-center flex">
                <span className="bg-black text-white">Scroll down</span>
              </h4>
              {response
                ? //@ts-ignore
                  response.products.nodes.map((product, index) => {
                    if (!scalesRef.current[index]) {
                      //@ts-ignore
                      scalesRef.current[index] = getRandomScale();
                    }

                    return (
                      <Link
                        key={product.id}
                        className="recommended-product bg-white border-black border-[1px] p-2"
                        to={`/products/${product.handle}`}
                        style={{
                          maxWidth: `${BASE_WIDTH}px`,
                          width: '100%',
                        }}
                        // style={{
                        //   transform: `scale(${scalesRef.current[index]})`,
                        // }}
                      >
                        <Image
                          data={product.images.nodes[0]}
                          aspectRatio="5/7"
                          sizes={`(min-width: 45em) ${BASE_WIDTH}px, 100vw`}
                        />
                        <h4>{product.title}</h4>
                        <small>
                          <Money data={product.priceRange.minVariantPrice} />
                        </small>
                      </Link>
                    );
                  })
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
};
