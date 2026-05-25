export interface Formula {
  id: string;
  title: string;
  latex: string;
  note?: string;
  display?: boolean; // true = displayMode (formulă pe rând separat)
}

export interface Chapter {
  title: string;
  formulas: Formula[];
}

export interface ClassData {
  cls: 'IX' | 'X' | 'XI' | 'XII';
  label: string;
  chapters: Chapter[];
}

export const FORMULA_DATA: ClassData[] = [
  // ─────────────────────────────────────────────────────────────────
  // CLASA A IX-A
  // ─────────────────────────────────────────────────────────────────
  {
    cls: 'IX',
    label: 'Clasa a IX-a',
    chapters: [
      {
        title: 'Mulțimi și operații',
        formulas: [
          {
            id: 'ix-m1',
            title: 'Reuniunea',
            latex: 'A \\cup B = \\{x \\mid x \\in A \\text{ sau } x \\in B\\}',
          },
          {
            id: 'ix-m2',
            title: 'Intersecția',
            latex: 'A \\cap B = \\{x \\mid x \\in A \\text{ și } x \\in B\\}',
          },
          {
            id: 'ix-m3',
            title: 'Diferența',
            latex: 'A \\setminus B = \\{x \\mid x \\in A \\text{ și } x \\notin B\\}',
          },
          {
            id: 'ix-m4',
            title: 'Cardinalul reuniunii',
            latex: '|A \\cup B| = |A| + |B| - |A \\cap B|',
            display: true,
          },
          {
            id: 'ix-m5',
            title: 'Legile lui De Morgan',
            latex:
              '\\overline{A \\cup B} = \\bar{A} \\cap \\bar{B}, \\quad \\overline{A \\cap B} = \\bar{A} \\cup \\bar{B}',
          },
        ],
      },
      {
        title: 'Numere reale și inegalități',
        formulas: [
          {
            id: 'ix-n1',
            title: 'Modulul',
            latex:
              '|a| = \\begin{cases} a & \\text{dacă } a \\ge 0 \\\\ -a & \\text{dacă } a < 0 \\end{cases}',
            display: true,
          },
          { id: 'ix-n2', title: 'Inegalitatea triunghiului', latex: '|a + b| \\le |a| + |b|' },
          {
            id: 'ix-n3',
            title: 'Media aritmetică',
            latex: 'M_A = \\dfrac{a + b}{2}',
            display: true,
          },
          {
            id: 'ix-n4',
            title: 'Media geometrică',
            latex: 'M_G = \\sqrt{ab}, \\quad a,b > 0',
            display: true,
          },
          {
            id: 'ix-n5',
            title: 'Media armonică',
            latex: 'M_H = \\dfrac{2ab}{a+b}, \\quad a,b > 0',
            display: true,
          },
          {
            id: 'ix-n6',
            title: 'Inegalitatea MA–MG',
            latex: '\\dfrac{a+b}{2} \\ge \\sqrt{ab}, \\quad a,b \\ge 0',
            display: true,
            note: 'Egalitate ⟺ a = b',
          },
          {
            id: 'ix-n7',
            title: 'Inegalitatea Cauchy-Schwarz',
            latex: '(a_1b_1 + \\ldots + a_nb_n)^2 \\le (a_1^2+\\ldots+a_n^2)(b_1^2+\\ldots+b_n^2)',
            display: true,
          },
        ],
      },
      {
        title: 'Puteri și radicali',
        formulas: [
          { id: 'ix-p1', title: 'Produsul puterilor', latex: 'a^m \\cdot a^n = a^{m+n}' },
          {
            id: 'ix-p2',
            title: 'Câtul puterilor',
            latex: 'a^m \\div a^n = a^{m-n}, \\quad a \\ne 0',
          },
          { id: 'ix-p3', title: 'Puterea puterii', latex: '(a^m)^n = a^{m \\cdot n}' },
          { id: 'ix-p4', title: 'Puterea produsului', latex: '(a \\cdot b)^n = a^n \\cdot b^n' },
          {
            id: 'ix-p5',
            title: 'Putere negativă',
            latex: 'a^{-n} = \\dfrac{1}{a^n}, \\quad a \\ne 0',
            display: true,
          },
          {
            id: 'ix-p6',
            title: 'Radical și putere fracționară',
            latex: '\\sqrt[n]{a^m} = a^{m/n}',
          },
          {
            id: 'ix-p7',
            title: 'Radicalizarea numitorului',
            latex:
              '\\dfrac{1}{\\sqrt{a}} = \\dfrac{\\sqrt{a}}{a}, \\quad \\dfrac{1}{\\sqrt{a}\\pm\\sqrt{b}} = \\dfrac{\\sqrt{a}\\mp\\sqrt{b}}{a-b}',
            display: true,
          },
        ],
      },
      {
        title: 'Ecuații de gradul I și II',
        formulas: [
          {
            id: 'ix-e1',
            title: 'Ecuație de gradul I',
            latex: 'ax + b = 0 \\Rightarrow x = -\\dfrac{b}{a}, \\quad a \\ne 0',
            display: true,
          },
          { id: 'ix-e2', title: 'Discriminantul', latex: '\\Delta = b^2 - 4ac', display: true },
          {
            id: 'ix-e3',
            title: 'Formulele de rezolvare',
            latex: 'x_{1,2} = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}',
            display: true,
          },
          {
            id: 'ix-e4',
            title: 'Relațiile lui Viète',
            latex: 'x_1 + x_2 = -\\dfrac{b}{a}, \\quad x_1 \\cdot x_2 = \\dfrac{c}{a}',
            display: true,
          },
          { id: 'ix-e5', title: 'Forma factorizată', latex: 'ax^2 + bx + c = a(x - x_1)(x - x_2)' },
        ],
      },
      {
        title: 'Funcții elementare',
        formulas: [
          {
            id: 'ix-f1',
            title: 'Funcția liniară',
            latex: 'f(x) = ax + b, \\quad a \\ne 0',
            note: 'Zero: x₀ = −b/a',
          },
          {
            id: 'ix-f2',
            title: 'Funcția de gradul II — forma generală',
            latex: 'f(x) = ax^2 + bx + c, \\quad a \\ne 0',
          },
          {
            id: 'ix-f3',
            title: 'Vârful parabolei',
            latex: 'V\\!\\left(-\\dfrac{b}{2a},\\; -\\dfrac{\\Delta}{4a}\\right)',
            display: true,
          },
          {
            id: 'ix-f4',
            title: 'Forma canonică',
            latex: 'f(x) = a\\left(x + \\dfrac{b}{2a}\\right)^2 - \\dfrac{\\Delta}{4a}',
            display: true,
          },
          {
            id: 'ix-f5',
            title: 'Semn funcție gr. II',
            latex:
              '\\text{Dacă } a>0: f(x) \\ge 0 \\text{ pt. } x \\in [x_1, x_2]^c; \\text{ dacă } a<0: f(x)\\ge0 \\text{ pt. } x\\in[x_1,x_2]',
            note: 'valabil când Δ > 0',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // CLASA A X-A
  // ─────────────────────────────────────────────────────────────────
  {
    cls: 'X',
    label: 'Clasa a X-a',
    chapters: [
      {
        title: 'Funcții (proprietăți generale)',
        formulas: [
          { id: 'x-f1', title: 'Funcție compusă', latex: '(g \\circ f)(x) = g(f(x))' },
          {
            id: 'x-f2',
            title: 'Funcție inversă',
            latex: 'f^{-1}: Y \\to X, \\quad f^{-1}(f(x)) = x',
            note: 'Există ⟺ f bijectivă',
          },
          {
            id: 'x-f3',
            title: 'Graficul funcției inverse',
            latex:
              '\\text{Graficul lui } f^{-1} = \\text{reflecția graficului } f \\text{ față de } y=x',
          },
        ],
      },
      {
        title: 'Funcția exponențială',
        formulas: [
          {
            id: 'x-exp1',
            title: 'Definiție',
            latex: 'f: \\mathbb{R} \\to (0,\\infty), \\quad f(x) = a^x, \\quad a>0, a\\ne1',
          },
          { id: 'x-exp2', title: 'Produs', latex: 'a^{x+y} = a^x \\cdot a^y' },
          { id: 'x-exp3', title: 'Cât', latex: 'a^{x-y} = \\dfrac{a^x}{a^y}', display: true },
          { id: 'x-exp4', title: 'Puterea puterii', latex: '(a^x)^y = a^{xy}' },
          {
            id: 'x-exp5',
            title: 'Monotonie',
            latex:
              'a>1 \\Rightarrow \\text{crescătoare;} \\quad 0<a<1 \\Rightarrow \\text{descrescătoare}',
          },
        ],
      },
      {
        title: 'Funcția logaritmică',
        formulas: [
          {
            id: 'x-log1',
            title: 'Definiție',
            latex: '\\log_a x = y \\Leftrightarrow a^y = x, \\quad a>0, a\\ne1, x>0',
          },
          {
            id: 'x-log2',
            title: 'Produsul',
            latex: '\\log_a(xy) = \\log_a x + \\log_a y',
            display: true,
          },
          {
            id: 'x-log3',
            title: 'Câtul',
            latex: '\\log_a\\dfrac{x}{y} = \\log_a x - \\log_a y',
            display: true,
          },
          {
            id: 'x-log4',
            title: 'Puterea',
            latex: '\\log_a x^n = n \\cdot \\log_a x',
            display: true,
          },
          {
            id: 'x-log5',
            title: 'Schimbarea bazei',
            latex: '\\log_a x = \\dfrac{\\log_b x}{\\log_b a} = \\dfrac{\\ln x}{\\ln a}',
            display: true,
          },
          {
            id: 'x-log6',
            title: 'Valori speciale',
            latex: '\\log_a 1 = 0, \\quad \\log_a a = 1, \\quad \\log_a a^n = n',
          },
          {
            id: 'x-log7',
            title: 'Logaritm natural',
            latex: '\\ln x = \\log_e x, \\quad e \\approx 2{,}718\\ldots',
          },
        ],
      },
      {
        title: 'Trigonometrie',
        formulas: [
          {
            id: 'x-t1',
            title: 'Relația fundamentală',
            latex: '\\sin^2 x + \\cos^2 x = 1',
            display: true,
          },
          {
            id: 'x-t2',
            title: 'Relații derivate',
            latex:
              '1 + \\tan^2 x = \\dfrac{1}{\\cos^2 x}, \\quad 1 + \\cot^2 x = \\dfrac{1}{\\sin^2 x}',
            display: true,
          },
          {
            id: 'x-t3',
            title: 'sin(a ± b)',
            latex: '\\sin(a \\pm b) = \\sin a \\cos b \\pm \\cos a \\sin b',
            display: true,
          },
          {
            id: 'x-t4',
            title: 'cos(a ± b)',
            latex: '\\cos(a \\pm b) = \\cos a \\cos b \\mp \\sin a \\sin b',
            display: true,
          },
          {
            id: 'x-t5',
            title: 'tan(a ± b)',
            latex: '\\tan(a \\pm b) = \\dfrac{\\tan a \\pm \\tan b}{1 \\mp \\tan a \\tan b}',
            display: true,
          },
          { id: 'x-t6', title: 'sin 2a', latex: '\\sin 2a = 2\\sin a \\cos a', display: true },
          {
            id: 'x-t7',
            title: 'cos 2a',
            latex: '\\cos 2a = \\cos^2 a - \\sin^2 a = 1 - 2\\sin^2 a = 2\\cos^2 a - 1',
            display: true,
          },
          {
            id: 'x-t8',
            title: 'Formule de injumătățire',
            latex:
              '\\sin^2 a = \\dfrac{1 - \\cos 2a}{2}, \\quad \\cos^2 a = \\dfrac{1 + \\cos 2a}{2}',
            display: true,
          },
          {
            id: 'x-t9',
            title: 'Produs → sumă',
            latex: '\\sin a \\cdot \\cos b = \\tfrac{1}{2}[\\sin(a+b)+\\sin(a-b)]',
            display: true,
          },
          {
            id: 'x-t10',
            title: 'Sumă → produs',
            latex: '\\sin a + \\sin b = 2\\sin\\tfrac{a+b}{2}\\cos\\tfrac{a-b}{2}',
            display: true,
          },
          {
            id: 'x-t11',
            title: 'Teorema sinusurilor',
            latex: '\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C} = 2R',
            display: true,
          },
          {
            id: 'x-t12',
            title: 'Teorema cosinusurilor',
            latex: 'a^2 = b^2 + c^2 - 2bc\\cos A',
            display: true,
          },
          {
            id: 'x-t13',
            title: 'Aria triunghiului',
            latex: 'S = \\dfrac{1}{2}ab\\sin C = \\dfrac{abc}{4R} = p \\cdot r',
            display: true,
            note: 'p = semiperimetru, r = raza cercului inscris',
          },
        ],
      },
      {
        title: 'Geometrie analitică plană',
        formulas: [
          {
            id: 'x-g1',
            title: 'Distanța între două puncte',
            latex: 'd(A,B) = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
            display: true,
          },
          {
            id: 'x-g2',
            title: 'Mijlocul segmentului',
            latex: 'M = \\left(\\dfrac{x_1+x_2}{2}, \\dfrac{y_1+y_2}{2}\\right)',
            display: true,
          },
          {
            id: 'x-g3',
            title: 'Panta dreptei',
            latex: 'm = \\dfrac{y_2 - y_1}{x_2 - x_1}',
            display: true,
          },
          {
            id: 'x-g4',
            title: 'Ecuația dreptei (punct + pantă)',
            latex: 'y - y_1 = m(x - x_1)',
            display: true,
          },
          { id: 'x-g5', title: 'Ecuația generală a dreptei', latex: 'ax + by + c = 0' },
          {
            id: 'x-g6',
            title: 'Drepte paralele / perpendiculare',
            latex:
              'd_1 \\parallel d_2 \\Leftrightarrow m_1 = m_2, \\quad d_1 \\perp d_2 \\Leftrightarrow m_1 \\cdot m_2 = -1',
          },
          {
            id: 'x-g7',
            title: 'Distanța de la punct la dreaptă',
            latex: 'd(P, d) = \\dfrac{|ax_0 + by_0 + c|}{\\sqrt{a^2+b^2}}',
            display: true,
          },
          {
            id: 'x-g8',
            title: 'Produs scalar',
            latex: '\\vec{u}\\cdot\\vec{v} = |\\vec{u}||\\vec{v}|\\cos\\theta = x_1 x_2 + y_1 y_2',
            display: true,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // CLASA A XI-A
  // ─────────────────────────────────────────────────────────────────
  {
    cls: 'XI',
    label: 'Clasa a XI-a',
    chapters: [
      {
        title: 'Combinatorică',
        formulas: [
          { id: 'xi-c1', title: 'Permutări', latex: 'P_n = n!', display: true },
          {
            id: 'xi-c2',
            title: 'Aranjamente',
            latex: 'A_n^k = \\dfrac{n!}{(n-k)!}',
            display: true,
          },
          {
            id: 'xi-c3',
            title: 'Combinări',
            latex: 'C_n^k = \\binom{n}{k} = \\dfrac{n!}{k!(n-k)!}',
            display: true,
          },
          {
            id: 'xi-c4',
            title: 'Proprietăți combinări',
            latex: 'C_n^k = C_n^{n-k}, \\quad C_n^0 = C_n^n = 1',
          },
          {
            id: 'xi-c5',
            title: 'Triunghiul lui Pascal',
            latex: 'C_n^k = C_{n-1}^{k-1} + C_{n-1}^k',
            display: true,
          },
          {
            id: 'xi-c6',
            title: 'Binomul lui Newton',
            latex: '(a+b)^n = \\sum_{k=0}^{n} C_n^k \\, a^{n-k} b^k',
            display: true,
          },
          {
            id: 'xi-c7',
            title: 'Termenul general',
            latex: 'T_{k+1} = C_n^k \\, a^{n-k} b^k',
            display: true,
          },
        ],
      },
      {
        title: 'Matrice și determinanți',
        formulas: [
          {
            id: 'xi-m1',
            title: 'Determinant 2×2',
            latex: '\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix} = ad - bc',
            display: true,
          },
          {
            id: 'xi-m2',
            title: 'Determinant 3×3 (Sarrus)',
            latex:
              '\\det A = a_{11}a_{22}a_{33}+a_{12}a_{23}a_{31}+a_{13}a_{21}a_{32} - a_{13}a_{22}a_{31}-a_{12}a_{21}a_{33}-a_{11}a_{23}a_{32}',
            display: true,
          },
          {
            id: 'xi-m3',
            title: 'Inversa matricei',
            latex: 'A^{-1} = \\dfrac{1}{\\det A} \\cdot A^*',
            display: true,
            note: 'A* = matricea adjunctă (transpusa cofactorilor)',
          },
          {
            id: 'xi-m4',
            title: 'Regula lui Cramer',
            latex: 'x_i = \\dfrac{\\Delta_i}{\\Delta}, \\quad \\Delta \\ne 0',
            display: true,
          },
          {
            id: 'xi-m5',
            title: 'Rangul matricei',
            latex:
              '\\operatorname{rang}(A) = r \\Leftrightarrow \\exists \\text{ minor de ord. } r \\ne 0, \\text{ toți minorii de ord. } r{+}1 = 0',
          },
        ],
      },
      {
        title: 'Progresii',
        formulas: [
          {
            id: 'xi-pa1',
            title: 'Termenul general (PA)',
            latex: 'a_n = a_1 + (n-1)r',
            display: true,
          },
          {
            id: 'xi-pa2',
            title: 'Suma primilor n termeni (PA)',
            latex: 'S_n = \\dfrac{n(a_1 + a_n)}{2} = na_1 + \\dfrac{n(n-1)}{2}r',
            display: true,
          },
          { id: 'xi-pa3', title: 'Proprietatea termenilor PA', latex: '2a_n = a_{n-1} + a_{n+1}' },
          {
            id: 'xi-pg1',
            title: 'Termenul general (PG)',
            latex: 'b_n = b_1 \\cdot q^{n-1}',
            display: true,
          },
          {
            id: 'xi-pg2',
            title: 'Suma primilor n termeni (PG)',
            latex: 'S_n = b_1 \\cdot \\dfrac{q^n - 1}{q - 1}, \\quad q \\ne 1',
            display: true,
          },
          {
            id: 'xi-pg3',
            title: 'Suma PG infinită (|q|<1)',
            latex: 'S = \\dfrac{b_1}{1-q}, \\quad |q| < 1',
            display: true,
          },
          {
            id: 'xi-pg4',
            title: 'Proprietatea termenilor PG',
            latex: 'b_n^2 = b_{n-1} \\cdot b_{n+1}',
          },
        ],
      },
      {
        title: 'Limite și continuitate',
        formulas: [
          {
            id: 'xi-l1',
            title: 'Limita fundamentală 1',
            latex: '\\lim_{x \\to 0} \\dfrac{\\sin x}{x} = 1',
            display: true,
          },
          {
            id: 'xi-l2',
            title: 'Numărul lui e',
            latex: '\\lim_{n \\to \\infty}\\left(1 + \\dfrac{1}{n}\\right)^n = e',
            display: true,
          },
          {
            id: 'xi-l3',
            title: 'Limita fundamentală 3',
            latex: '\\lim_{x \\to 0}(1+x)^{1/x} = e',
            display: true,
          },
          {
            id: 'xi-l4',
            title: 'Limita log',
            latex: '\\lim_{x \\to 0}\\dfrac{\\ln(1+x)}{x} = 1',
            display: true,
          },
          {
            id: 'xi-l5',
            title: 'Forme nedeterminate',
            latex:
              '\\tfrac{0}{0},\\; \\tfrac{\\infty}{\\infty},\\; 0 \\cdot \\infty,\\; \\infty - \\infty,\\; 0^0,\\; \\infty^0,\\; 1^\\infty',
            note: "Se ridică la exponent sau se aplică L'Hôpital",
          },
          {
            id: 'xi-l6',
            title: 'Operații cu limite',
            latex:
              '\\lim(f \\pm g) = \\lim f \\pm \\lim g, \\quad \\lim(f\\cdot g) = \\lim f \\cdot \\lim g',
          },
        ],
      },
      {
        title: 'Derivate',
        formulas: [
          {
            id: 'xi-d1',
            title: 'Definiția derivatei',
            latex: "f'(x) = \\lim_{h \\to 0} \\dfrac{f(x+h) - f(x)}{h}",
            display: true,
          },
          { id: 'xi-d2', title: 'Derivata constantei', latex: "(c)' = 0" },
          { id: 'xi-d3', title: 'Derivata puterii', latex: "(x^n)' = n x^{n-1}", display: true },
          {
            id: 'xi-d4',
            title: 'Derivate trigonometrice',
            latex: "(\\sin x)' = \\cos x, \\quad (\\cos x)' = -\\sin x",
            display: true,
          },
          {
            id: 'xi-d5',
            title: 'Derivate tan / cot',
            latex: "(\\tan x)' = \\dfrac{1}{\\cos^2 x}, \\quad (\\cot x)' = -\\dfrac{1}{\\sin^2 x}",
            display: true,
          },
          {
            id: 'xi-d6',
            title: 'Derivate exp / log',
            latex: "(e^x)' = e^x, \\quad (a^x)' = a^x \\ln a, \\quad (\\ln x)' = \\dfrac{1}{x}",
            display: true,
          },
          {
            id: 'xi-d7',
            title: 'Derivate arcfuncții',
            latex:
              "(\\arcsin x)' = \\dfrac{1}{\\sqrt{1-x^2}}, \\quad (\\arctan x)' = \\dfrac{1}{1+x^2}",
            display: true,
          },
          {
            id: 'xi-d8',
            title: 'Suma și produsul',
            latex: "(f \\pm g)' = f' \\pm g', \\quad (fg)' = f'g + fg'",
          },
          {
            id: 'xi-d9',
            title: 'Câtul',
            latex: "\\left(\\dfrac{f}{g}\\right)' = \\dfrac{f'g - fg'}{g^2}, \\quad g \\ne 0",
            display: true,
          },
          {
            id: 'xi-d10',
            title: 'Funcția compusă (regula lanțului)',
            latex: "(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)",
            display: true,
          },
          {
            id: 'xi-d11',
            title: 'Ecuația tangentei',
            latex: "y - f(a) = f'(a)(x - a)",
            display: true,
          },
          {
            id: 'xi-d12',
            title: "Regula L'Hôpital",
            latex: "\\lim_{x\\to a}\\dfrac{f(x)}{g(x)} = \\lim_{x\\to a}\\dfrac{f'(x)}{g'(x)}",
            display: true,
            note: 'Dacă limita este de forma 0/0 sau ∞/∞',
          },
        ],
      },
      {
        title: 'Studiul funcțiilor',
        formulas: [
          {
            id: 'xi-sf1',
            title: 'Monotonie',
            latex:
              "f'(x) > 0 \\Rightarrow f \\text{ crescătoare}; \\quad f'(x) < 0 \\Rightarrow f \\text{ descrescătoare}",
          },
          {
            id: 'xi-sf2',
            title: 'Extrem local',
            latex:
              "f'(a)=0 \\text{ și } f' \\text{ schimbă semnul} \\Rightarrow \\text{extrem local în } x=a",
          },
          {
            id: 'xi-sf3',
            title: 'Concavitate',
            latex:
              "f''(x) > 0 \\Rightarrow \\text{convexă}; \\quad f''(x) < 0 \\Rightarrow \\text{concavă}",
          },
          {
            id: 'xi-sf4',
            title: 'Punct de inflexiune',
            latex:
              "f''(a) = 0 \\text{ și } f'' \\text{ schimbă semnul} \\Rightarrow \\text{inflexiune în } x=a",
          },
          {
            id: 'xi-sf5',
            title: 'Asimptotă orizontală',
            latex: 'y = L \\text{ dacă } \\lim_{x\\to\\pm\\infty} f(x) = L',
          },
          {
            id: 'xi-sf6',
            title: 'Asimptotă oblică',
            latex:
              'y = mx + n, \\quad m = \\lim_{x\\to\\infty}\\dfrac{f(x)}{x}, \\quad n = \\lim_{x\\to\\infty}[f(x)-mx]',
            display: true,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // CLASA A XII-A
  // ─────────────────────────────────────────────────────────────────
  {
    cls: 'XII',
    label: 'Clasa a XII-a',
    chapters: [
      {
        title: 'Primitive (integrale nedefinite)',
        formulas: [
          {
            id: 'xii-p1',
            title: 'Primitiva puterii',
            latex: '\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C, \\quad n \\ne -1',
            display: true,
          },
          {
            id: 'xii-p2',
            title: 'Primitiva lui 1/x',
            latex: '\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C',
            display: true,
          },
          {
            id: 'xii-p3',
            title: 'Primitiva exponenței',
            latex: '\\int e^x\\,dx = e^x + C, \\quad \\int a^x\\,dx = \\dfrac{a^x}{\\ln a} + C',
            display: true,
          },
          {
            id: 'xii-p4',
            title: 'Primitive trigonometrice',
            latex: '\\int \\sin x\\,dx = -\\cos x + C, \\quad \\int \\cos x\\,dx = \\sin x + C',
            display: true,
          },
          {
            id: 'xii-p5',
            title: 'Primitive tan / cot',
            latex:
              '\\int \\dfrac{1}{\\cos^2 x}\\,dx = \\tan x + C, \\quad \\int \\dfrac{1}{\\sin^2 x}\\,dx = -\\cot x + C',
            display: true,
          },
          {
            id: 'xii-p6',
            title: 'Primitive arcfuncții',
            latex:
              '\\int \\dfrac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin x + C, \\quad \\int \\dfrac{1}{1+x^2}\\,dx = \\arctan x + C',
            display: true,
          },
          {
            id: 'xii-p7',
            title: 'Integrare prin părți',
            latex: "\\int f \\cdot g'\\,dx = f \\cdot g - \\int f' \\cdot g\\,dx",
            display: true,
          },
          {
            id: 'xii-p8',
            title: 'Schimbare de variabilă',
            latex: "\\int f(g(x))g'(x)\\,dx = \\int f(t)\\,dt \\Big|_{t=g(x)}",
            display: true,
          },
          {
            id: 'xii-p9',
            title: 'Liniaritate',
            latex:
              '\\int [\\alpha f(x) + \\beta g(x)]\\,dx = \\alpha\\int f(x)\\,dx + \\beta\\int g(x)\\,dx',
          },
        ],
      },
      {
        title: 'Integrala definită',
        formulas: [
          {
            id: 'xii-id1',
            title: 'Teorema fundamentală a calculului',
            latex: '\\int_a^b f(x)\\,dx = F(b) - F(a)',
            display: true,
            note: 'unde F este o primitivă a lui f',
          },
          {
            id: 'xii-id2',
            title: 'Proprietăți (liniaritate)',
            latex:
              '\\int_a^b [\\alpha f + \\beta g]\\,dx = \\alpha\\int_a^b f\\,dx + \\beta\\int_a^b g\\,dx',
          },
          {
            id: 'xii-id3',
            title: 'Aditivitate',
            latex: '\\int_a^b f\\,dx = \\int_a^c f\\,dx + \\int_c^b f\\,dx',
          },
          {
            id: 'xii-id4',
            title: 'Integrala funcției pozitive',
            latex: 'f(x)\\ge 0 \\text{ pe } [a,b] \\Rightarrow \\int_a^b f(x)\\,dx \\ge 0',
          },
          {
            id: 'xii-id5',
            title: 'Aria sub grafic',
            latex: 'S = \\int_a^b |f(x)|\\,dx',
            display: true,
          },
          {
            id: 'xii-id6',
            title: 'Aria între două curbe',
            latex: 'S = \\int_a^b |f(x) - g(x)|\\,dx',
            display: true,
          },
          {
            id: 'xii-id7',
            title: 'Integrare prin părți (definită)',
            latex: "\\int_a^b f g'\\,dx = \\Big[fg\\Big]_a^b - \\int_a^b f'g\\,dx",
            display: true,
          },
          {
            id: 'xii-id8',
            title: 'Lungimea arcului de curbă',
            latex: "L = \\int_a^b \\sqrt{1 + [f'(x)]^2}\\,dx",
            display: true,
          },
          {
            id: 'xii-id9',
            title: 'Volumul solidului de rotație',
            latex: 'V = \\pi \\int_a^b [f(x)]^2\\,dx',
            display: true,
          },
        ],
      },
      {
        title: 'Geometrie în spațiu',
        formulas: [
          {
            id: 'xii-gs1',
            title: 'Produs scalar (3D)',
            latex:
              '\\vec{u}\\cdot\\vec{v} = x_1x_2+y_1y_2+z_1z_2 = |\\vec{u}||\\vec{v}|\\cos\\theta',
            display: true,
          },
          {
            id: 'xii-gs2',
            title: 'Produs vectorial',
            latex:
              '\\vec{u}\\times\\vec{v} = \\begin{vmatrix}\\vec{i}&\\vec{j}&\\vec{k}\\\\x_1&y_1&z_1\\\\x_2&y_2&z_2\\end{vmatrix}',
            display: true,
          },
          {
            id: 'xii-gs3',
            title: 'Produs mixt',
            latex:
              '(\\vec{u},\\vec{v},\\vec{w}) = \\vec{u}\\cdot(\\vec{v}\\times\\vec{w}) = \\begin{vmatrix}x_1&y_1&z_1\\\\x_2&y_2&z_2\\\\x_3&y_3&z_3\\end{vmatrix}',
            display: true,
          },
          {
            id: 'xii-gs4',
            title: 'Ecuația planului',
            latex: 'ax + by + cz + d = 0',
            note: '(a,b,c) = vectorul normal',
          },
          {
            id: 'xii-gs5',
            title: 'Ecuația dreptei în spațiu',
            latex: '\\dfrac{x-x_0}{l} = \\dfrac{y-y_0}{m} = \\dfrac{z-z_0}{n}',
            display: true,
          },
          {
            id: 'xii-gs6',
            title: 'Distanța de la punct la plan',
            latex: 'd(P,\\pi) = \\dfrac{|ax_0+by_0+cz_0+d|}{\\sqrt{a^2+b^2+c^2}}',
            display: true,
          },
          {
            id: 'xii-gs7',
            title: 'Unghiul dintre plane',
            latex: '\\cos\\theta = \\dfrac{|\\vec{n_1}\\cdot\\vec{n_2}|}{|\\vec{n_1}||\\vec{n_2}|}',
            display: true,
          },
          {
            id: 'xii-gs8',
            title: 'Volum tetraedru',
            latex: 'V = \\dfrac{1}{6}|\\,(\\vec{AB},\\vec{AC},\\vec{AD})\\,|',
            display: true,
          },
        ],
      },
      {
        title: 'Probabilități și statistică',
        formulas: [
          {
            id: 'xii-pr1',
            title: 'Probabilitatea clasică',
            latex: 'P(A) = \\dfrac{|A|}{|\\Omega|}',
            display: true,
          },
          {
            id: 'xii-pr2',
            title: 'Reuniunea evenimentelor',
            latex: 'P(A\\cup B) = P(A) + P(B) - P(A\\cap B)',
            display: true,
          },
          {
            id: 'xii-pr3',
            title: 'Evenimente incompatibile',
            latex: 'A\\cap B = \\emptyset \\Rightarrow P(A\\cup B) = P(A) + P(B)',
          },
          {
            id: 'xii-pr4',
            title: 'Probabilitate condiționată',
            latex: 'P(A|B) = \\dfrac{P(A\\cap B)}{P(B)}, \\quad P(B)\\ne 0',
            display: true,
          },
          {
            id: 'xii-pr5',
            title: 'Teorema lui Bayes',
            latex: 'P(H_i|A) = \\dfrac{P(H_i)\\cdot P(A|H_i)}{\\sum_j P(H_j)\\cdot P(A|H_j)}',
            display: true,
          },
          {
            id: 'xii-pr6',
            title: 'Distribuția binomială',
            latex: 'P(X=k) = C_n^k p^k (1-p)^{n-k}',
            display: true,
          },
          {
            id: 'xii-pr7',
            title: 'Media distribuției binomiale',
            latex: 'E(X) = np, \\quad D(X) = np(1-p)',
            display: true,
          },
        ],
      },
    ],
  },
];
