// function Checkbox() {
//   return (
//     <div className="max-w-7xl mx-auto px-4 py-12">
//       <div className="grid grid-cols-3 gap-8">
//         {/* 언어 섹션 */}
//         <div>
//           <div className="space-y-3">
//             <label className="flex items-center text-lg font-semibold">언어</label>
//             {['JavaScript', 'TypeScript', 'Python', 'Java'].map((lang) => (
//               <label key={lang} className="flex items-center space-x-2">
//                 <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
//                 <span className="text-gray-700">{lang}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         {/* 프레임워크 섹션 */}
//         <div>
//           <div className="space-y-3">
//             <label className="flex items-center text-lg font-semibold">프레임워크</label>
//             {['React', 'Next.js', 'Express', 'Django'].map((framework) => (
//               <label key={framework} className="flex items-center space-x-2">
//                 <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
//                 <span className="text-gray-700">{framework}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         {/* 아키텍처 섹션 */}
//         <div>
//           <div className="space-y-3">
//             <label className="flex items-center text-lg font-semibold">아키텍처</label>
//             {['MVC', 'Clean Architecture', 'Microservices', 'Monolithic'].map((arch) => (
//               <label key={arch} className="flex items-center space-x-2">
//                 <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
//                 <span className="text-gray-700">{arch}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-end mt-8">
//         <button className="bg-black text-white px-8 py-2 rounded-md hover:bg-gray-800 transition-colors">
//           Submit
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Checkbox; 

function ProjectDescription() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-xl font-bold text-center mb-8 text-gray-800">
        프로젝트 구조 자동 생성기란?
      </h2>

      {/* 카드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        {/* 개요 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-700">개요</h3>
          </div>
          <p className="text-gray-500 text-left leading-relaxed">
            <strong>언어, 프레임워크, 아키텍처</strong> 선택만으로<br />
            표준화된 <strong>프로젝트 구조</strong>를 자동 생성합니다.
          </p>
        </div>

        {/* 기능 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-700">기능</h3>
          </div>
          <p className="text-gray-500 text-left leading-relaxed">
            <strong>디렉터리 구조</strong>와 <strong>README.md</strong> 포함 결과물을 <strong>즉시 다운로드</strong>할 수 있습니다.
          </p>
        </div>

        {/* 장점 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-700">장점</h3>
          </div>
          <p className="text-gray-500 text-left leading-relaxed">
            설정을 저장해 <strong>재사용</strong> 가능하며,<br />
            <strong>시간 절약</strong>과 <strong>학습 효율 향상</strong>에 도움이 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProjectDescription;