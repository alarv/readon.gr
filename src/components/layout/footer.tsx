import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/30 mt-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Σχετικά με εμάς</h3>
            <p className="text-sm text-muted-foreground">
              Το readon.gr είναι ένα σύγχρονο ελληνικό forum που προάγει τη δημοκρατική συζήτηση.
            </p>
            <p className="text-xs text-muted-foreground">
              Η διαχείριση περιεχομένου γίνεται με τη βοήθεια τεχνητής νοημοσύνης για καλύτερη εμπειρία χρήστη.
            </p>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Νομικά</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Όροι Χρήσης
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Πολιτική Απορρήτου
                </Link>
              </li>
              <li>
                <Link href="/community-guidelines" className="text-muted-foreground hover:text-foreground">
                  Κανόνες Κοινότητας
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Υποστήριξη</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground">
                  Βοήθεια
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Επικοινωνία
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-muted-foreground hover:text-foreground">
                  Αναφορά Προβλήματος
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Κοινότητα</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/c/general" className="text-muted-foreground hover:text-foreground">
                  Γενικά
                </Link>
              </li>
              <li>
                <Link href="/c/technologia" className="text-muted-foreground hover:text-foreground">
                  Τεχνολογία
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-muted-foreground hover:text-foreground">
                  Στατιστικά
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} readon.gr. Όλα τα δικαιώματα διατηρούνται.
          </p>
          <p className="text-xs text-muted-foreground mt-2 sm:mt-0">
            Δημιουργήθηκε με αγάπη για την ελληνική κοινότητα
          </p>
        </div>
      </div>
    </footer>
  )
}