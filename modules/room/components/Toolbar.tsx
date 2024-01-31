import { useSetOptions } from '@/common/recoil/options/options.hooks';

export const Toolbar = () => {
  const setOptions = useSetOptions();

  return (
    <div className="absolute left-0 top-0 z-50 flex gap-5 bg-black text-white">
      <button
        className=""
        onClick={() => setOptions((prev) => ({ ...prev, lineColor: 'red' }))}
      >
        Red
      </button>
      <button
        className=""
        onClick={() => setOptions((prev) => ({ ...prev, lineColor: 'green' }))}
      >
        Green
      </button>
      <button
        className=""
        onClick={() => setOptions((prev) => ({ ...prev, lineColor: 'blue' }))}
      >
        blue
      </button>
      <button
        className=""
        onClick={() => setOptions((prev) => ({ ...prev, lineColor: 'black' }))}
      >
        black
      </button>
    </div>
  );
};
