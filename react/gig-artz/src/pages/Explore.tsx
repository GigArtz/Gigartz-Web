import ExploreTabs from "../components/ExploreTabs";

function Explore() {
  return (
    <div className="main-content animate-fade-in-up transition-all duration-500">
      <div className="flex flex-col justify-evenly animate-slide-in-left">
        <ExploreTabs />
      </div>
    </div>
  );
}

export default Explore;
