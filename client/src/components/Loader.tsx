const Loader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="relative w-16 h-16">
        <div className="loader absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-primary border-r-transparent border-b-secondary border-l-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="ri-hand-heart-line text-primary text-xl"></i>
        </div>
      </div>
    </div>
  );
};

export default Loader;
