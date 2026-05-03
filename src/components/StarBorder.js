import React from 'react';

const StarBorder = ({
  as: Component = 'div',
  className = '',
  color = 'white',
  speed = '6s',
  thickness = 2,
  children,
  ...rest
}) => {
  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[20px] ${className}`}
      {...rest}
      style={{
        padding: `${thickness}px`,
        ...rest.style
      }}
    >
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 25%)`,
          animationDuration: speed
        }}
      ></div>
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 25%)`,
          animationDuration: speed
        }}
      ></div>
      <div className={`relative z-1 bg-gradient-to-b from-slate-900 to-black border border-white/10 text-white py-8 px-6 rounded-[20px] ${className.includes('text-center') ? 'text-center' : ''}`}>
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
