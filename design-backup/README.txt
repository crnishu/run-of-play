ORIGINAL (PRE-FUT) DESIGN BACKUP
================================

The UI was redesigned into a FIFA Ultimate Team collectible-card look on 2026-06-27.
This folder holds the original "pre-FUT" versions of every file that was rewritten,
so you can revert if you ever want the old look back.

HOW TO REVERT EACH FILE
-----------------------
1. CareerCard.tsx
   Copy CareerCard.tsx.txt over  components/CareerCard.tsx

2. Home page
   Copy page.tsx.txt over        app/page.tsx

3. My Careers binder
   Copy SavedCareers.tsx.txt over components/SavedCareers.tsx

4. globals.css  (NOT backed up as a whole file — it was only added to)
   - Delete the block between the  [BEGIN FUT REDESIGN]  and  [END FUT REDESIGN]
     banner comments.
   - Undo the two small inline-noted tweaks (search "FUT redesign" in the file):
       .primary  -> background: var(--lime);   (remove the gradient + box-shadow)
       .card     -> remove the box-shadow line

NOT PART OF THE REVERT (keep these — they are bug fixes / additive helpers)
--------------------------------------------------------------------------
- components/ui/Flag.tsx   : flag-size fix (snaps to valid flagcdn sizes). Keep.
- lib/helpers.ts cardTier(): only used by the FUT design; harmless to leave.

After reverting, restart the dev server (npm run dev).
