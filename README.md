# 📊 Dynamic Data Table Manager (Next.js + Redux + MUI)

A modern **Dynamic Data Table Manager** built with **Next.js 14**, **TypeScript**, **Redux Toolkit**, and **Material UI (MUI v5)**.  
Implements sorting, searching, pagination, dynamic columns, and CSV import/export — ideal for frontend interview tasks or real-world dashboards.

---

## 🚀 Features
✅ Table with sorting, global search & client-side pagination  
✅ Manage Columns (add / show / hide) with persistence (localStorage / Redux Persist)  
✅ CSV Import (PapaParse) & Export (FileSaver.js / Blob)  
💡 Bonus: Inline editing, row actions (edit/delete), dark mode, drag & drop reorder, responsive UI

---

## 🛠️ Tech Stack
- **Next.js 14 (App Router)**  
- **React 18 + TypeScript**  
- **Redux Toolkit + Redux Persist**  
- **Material UI v5**  
- **React Hook Form**  
- **PapaParse**, **FileSaver.js**

---

## ⚙️ Setup
```bash
# 1️⃣ Clone the repository
git clone https://github.com/<your-username>/dynamic-data-table.git
cd dynamic-data-table

# 2️⃣ Install dependencies
npm install

# 3️⃣ Start development server
npm run dev
# visit http://localhost:3000


## 📁 Default Columns

| Name             | Email         | Age        | Role             |
| ---------------- | ------------- | ---------- | ---------------- |
| Supports sorting | Global search | Pagination | Dynamic add/hide |

---

## 📂 Import / Export

**Import CSV:** Upload and parse `.csv` using PapaParse (validates headers & data).
**Export CSV:** Download visible table data as `.csv`.

Example format:

```csv
Name,Email,Age,Role,Department,Location
John Doe,john@example.com,30,Engineer,Product,Pune
```


---


