// src/features/MainPage/MainPage.tsx 
import Headline from './components/Headline';
import ProjectDescription from './components/Checkbox';
import TopNav from './components/TopNav';

function MainPage() {
  return (
    <div className="w-full min-h-screen">
      <TopNav />
      <main className="flex flex-col">
        <div className="w-full bg-gray-100 py-32">
          <Headline />
        </div>
        <div className="mt-5">
          <ProjectDescription />
        </div>
      </main>
    </div>
  );
}

export default MainPage;