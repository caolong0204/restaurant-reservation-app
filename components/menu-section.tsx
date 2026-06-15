const MENU = [
  {
    course: 'To begin',
    items: [
      {
        name: 'Heirloom tomato & burrata',
        desc: 'Basil oil, aged balsamic, sourdough crisp',
        price: '18',
      },
      {
        name: 'Seared diver scallops',
        desc: 'Cauliflower purée, brown butter, capers',
        price: '24',
      },
      {
        name: 'Forest mushroom tart',
        desc: 'Gruyère, thyme, soft farm egg',
        price: '16',
      },
    ],
  },
  {
    course: 'Mains',
    items: [
      {
        name: 'Roasted duck breast',
        desc: 'Cherry gastrique, charred endive, pommes purée',
        price: '38',
      },
      {
        name: 'Line-caught halibut',
        desc: 'Saffron broth, fennel, new potatoes',
        price: '42',
      },
      {
        name: 'Wild mushroom risotto',
        desc: 'Carnaroli rice, parmesan, truffle',
        price: '32',
      },
    ],
  },
  {
    course: 'To finish',
    items: [
      {
        name: 'Dark chocolate délice',
        desc: 'Salted caramel, crème fraîche',
        price: '14',
      },
      {
        name: 'Vanilla bean crème brûlée',
        desc: 'Seasonal berries, shortbread',
        price: '13',
      },
    ],
  },
]

export function MenuSection() {
  return (
    <section id="menu" className="scroll-mt-20 border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            The menu
          </p>
          <h2 className="mt-3 text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            A taste of the season
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
            Our menu changes often. Here is a sample of what you might find on
            your visit.
          </p>
        </div>

        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {MENU.map((section) => (
            <div key={section.course} className="flex flex-col gap-6">
              <h3 className="border-b border-border pb-3 font-serif text-xl font-semibold text-foreground">
                {section.course}
              </h3>
              <ul className="flex flex-col gap-5">
                {section.items.map((item) => (
                  <li key={item.name} className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="font-mono text-sm text-primary">
                        ${item.price}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
