function UnsupportedNetwork() {
  return (
    <div
      className={`w-full min-h-0 flex flex-col justify-center items-center text-center`}
    >
      <div className="lg:p-40 sm:p-20 bg-primary-900 rounded-xl">
        <h2 className="text-center font-bold text-lg">
          ⚠ DataX is not yet deployed to this chain.
        </h2>
        <p className="mt-3 mb-1">Please connect to a supported network.</p>
        <p>(Ethereum Mainnet, Polygon, Rinkeby)</p>
      </div>
    </div>
  );
}

export default UnsupportedNetwork;
