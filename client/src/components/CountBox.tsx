interface CountBoxProps {
  title: string;
  value: string | number;
}

const CountBox = ({ title, value }: CountBoxProps) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h4 className="font-bold text-2xl text-gray-900 dark:text-white">{value}</h4>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">{title}</p>
    </div>
  );
};

export default CountBox;
