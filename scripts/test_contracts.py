import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class ContractFixtures(unittest.TestCase):
    def test_all_fixture_references_and_deterministic_totality(self):
        fixtures = list((ROOT / 'contracts/fixtures').glob('*.json'))
        self.assertEqual(len(fixtures), 10)
        for path in fixtures:
            f = json.loads(path.read_text())
            m = f['machine']
            ids = {s['id'] for s in m['states']}
            self.assertEqual(len(ids), len(m['states']))
            self.assertIn(m['startState'], ids)
            for t in m['transitions']:
                self.assertIn(t['from'], ids)
                self.assertIn(t['to'], ids)
                self.assertTrue(t['symbol'] in m['alphabet'] or (m['kind']=='enfa' and t['symbol'] is None))
            if m['kind'] in ['dfa','mealy','moore']:
                pairs = [(t['from'],t['symbol']) for t in m['transitions']]
                self.assertEqual(len(set(pairs)),len(pairs))
                self.assertEqual(len(pairs),len(ids)*len(m['alphabet']))

    def test_d01_reference_is_ending_01_and_d02_has_redundancy(self):
        for name in ['D01','D02']:
            m=json.loads((ROOT/f'contracts/fixtures/{name}.json').read_text())['machine']
            table={(t['from'],t['symbol']):t['to'] for t in m['transitions']}
            for text in ['','0','1','01','101','10','011','0001']:
                state=m['startState']
                for c in text: state=table[state,c]
                self.assertEqual(state in m['finalStates'],text.endswith('01'))

if __name__ == '__main__':
    unittest.main()
