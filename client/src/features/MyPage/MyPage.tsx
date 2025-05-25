import { useState } from 'react';
import TopNav from '../MainPage/components/TopNav';

// 예시 프로젝트 데이터
const PROJECTS = [
  { id: 1, name: '팀 프로젝트1', date: '2022/03/20', type: 'Team project' },
  { id: 2, name: '팀 프로젝트2', date: '2021/03/20', type: 'Team project' },
  { id: 3, name: 'Holymoly', date: '2024/07/20', type: 'Holymoly' },
  { id: 4, name: '기타 프로젝트', date: '2024/03/20', type: 'Other' },
];

const CATEGORIES = [
  { label: 'All project', value: 'All' },
  { label: 'Team project', value: 'Team project' },
  { label: 'Holymoly', value: 'Holymoly' },
];

function Sidebar({ selected, onSelect }: { selected: string, onSelect: (cat: string) => void }) {
  return (
    <aside className="w-72 bg-white border rounded-xl p-6 flex flex-col gap-6 h-[600px]">
      {/* 유저 정보 */}
      <div className="flex flex-col items-center gap-2">
        <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="user" className="w-16 h-16 rounded-full" />
        <div className="font-semibold">user</div>
        <div className="text-xs text-gray-500">user@email.com</div>
      </div>
      {/* 검색 */}
      <div>
        <input
          type="text"
          placeholder="Search"
          className="w-full border rounded-md px-3 py-1 text-sm"
        />
      </div>
      {/* 프로젝트 트리 */}
      <div>
        <div className="font-semibold mb-2">Project Category</div>
        <ul className="ml-2 text-gray-600 text-sm space-y-1">
          {CATEGORIES.map(cat => (
            <li key={cat.value}>
              <button
                className={`w-full text-left px-2 py-1 rounded ${selected === cat.value ? 'bg-gray-200 font-bold' : 'hover:bg-gray-100'}`}
                onClick={() => onSelect(cat.value)}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function ProjectCard({ name, date }: { name: string, date: string }) {
  return (
    <div className="border rounded-lg p-4 flex flex-col items-start gap-2 min-w-[180px]">
      <div className="text-3xl text-gray-400">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v16H4z"/></svg>
      </div>
      <div className="font-medium">{name}</div>
      <div className="text-xs text-gray-500">{date}</div>
    </div>
  );
}

function ProjectGrid({ selectedCategory }: { selectedCategory: string }) {
  // 카테고리 필터링
  const filtered = selectedCategory === 'All'
    ? PROJECTS
    : PROJECTS.filter(p => p.type === selectedCategory);

  return (
    <div className="flex-1 flex flex-col">
      {/* 정렬 드롭다운 */}
      <div className="flex justify-end mb-6">
        <select className="border rounded-md px-3 py-1">
          <option>Recent</option>
          <option>Oldest</option>
        </select>
      </div>
      {/* 프로젝트 카드 그리드 */}
      <div className="grid grid-cols-3 gap-8">
        {filtered.map(p => (
          <ProjectCard key={p.id} name={p.name} date={p.date} />
        ))}
      </div>
    </div>
  );
}

export default function MyPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="flex gap-8 max-w-7xl mx-auto pt-24">
        <Sidebar selected={selectedCategory} onSelect={setSelectedCategory} />
        <ProjectGrid selectedCategory={selectedCategory} />
      </div>
    </div>
  );
}