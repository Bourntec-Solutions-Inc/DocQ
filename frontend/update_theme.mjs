import fs from 'fs';
import path from 'path';

const pagesDir = './src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

const replacements = [
    { p: /bg-\[\#0f111a\]/g, r: "dark:bg-[#0f111a] bg-[#f8fafc]" },
    { p: /bg-\[\#0B0D13\]/g, r: "dark:bg-[#0B0D13] bg-white" },
    { p: /bg-\[\#13151D\]/g, r: "dark:bg-[#13151D] bg-white shadow-sm" },
    { p: /bg-\[\#1A1D24\]/g, r: "dark:bg-[#1A1D24] bg-slate-50" },
    { p: /bg-\[\#14161c\]/g, r: "dark:bg-[#14161c] bg-slate-50" },
    { p: /bg-\[\#181a24\]/g, r: "dark:bg-[#181a24] bg-slate-100" },
    { p: /bg-\[\#0a0c11\]/g, r: "dark:bg-[#0a0c11] bg-[#f8fafc]" },
    { p: /text-gray-200/g, r: "dark:text-gray-200 text-gray-800" },
    { p: /text-white/g, r: "dark:text-white text-gray-900" },
    { p: /text-gray-300/g, r: "dark:text-gray-300 text-gray-700" },
    { p: /text-gray-400/g, r: "dark:text-gray-400 text-gray-600" },
    { p: /border-gray-800/g, r: "dark:border-gray-800 border-gray-200" },
    { p: /border-gray-700/g, r: "dark:border-gray-700 border-gray-300" },
    { p: /bg-gray-800/g, r: "dark:bg-gray-800 bg-gray-100" },
    { p: /bg-gray-700/g, r: "dark:bg-gray-700 bg-gray-200" }
];

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    for (const rep of replacements) {
        content = content.replace(rep.p, rep.r);
    }

    // Also manually inject ProfileMenu into Dashboard, CreateJob, ExecutionDetail
    if (file === 'Dashboard.tsx') {
        content = content.replace(
            /<div className="w-9 h-9 rounded-full bg-gray-700 overflow-hidden border border-gray-600">[\s\S]*?<\/div>/,
            "<ProfileMenu />"
        );
        if (!content.includes('ProfileMenu')) {
            content = `import { ProfileMenu } from "../components/ProfileMenu";\n` + content;
        }
    }

    if (file === 'ExecutionDetail.tsx') {
        content = content.replace(
            /<div className="w-8 h-8 rounded-full bg-orange-200 overflow-hidden border border-gray-600 cursor-pointer">[\s\S]*?<\/div>/,
            "<ProfileMenu />"
        );
        if (!content.includes('ProfileMenu')) {
            content = `import { ProfileMenu } from "../components/ProfileMenu";\n` + content;
        }
    }

    fs.writeFileSync(filePath, content);
}
console.log("Done");
