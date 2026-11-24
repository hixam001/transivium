"""Regression checks for failure modes that would corrupt shared memory."""

import copy
import csv
import io
import unittest

import memory


class MemoryChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.notes, errors = memory.collect(memory.ROOT)
        if errors:
            raise AssertionError(errors)

    def setUp(self):
        self.notes = copy.deepcopy(self.notes)

    def test_broken_handoff_link_is_rejected(self):
        self.notes["memory/Handoffs/Current"]["body"] += "\n[[memory/Handoffs/nonexistent]]\n"
        self.assertTrue(any("broken wikilink" in e for e in memory.validate(self.notes)))

    def test_missing_requirement_is_rejected(self):
        del self.notes["memory/Requirements/FR-13"]
        self.assertTrue(
            any("requirement coverage mismatch" in e for e in memory.validate(self.notes))
        )

    def test_nonreciprocal_ownership_is_rejected(self):
        self.notes["memory/Requirements/FR-13"]["fields"]["owners"] = ["TRN-04"]
        self.assertTrue(
            any("owner mismatch" in e or "reciprocal" in e for e in memory.validate(self.notes))
        )

    def test_dependency_cycle_is_rejected(self):
        self.notes["memory/Issues/TRN-02"]["fields"]["depends_on"] = ["TRN-03"]
        self.assertTrue(any("dependency cycle" in e for e in memory.validate(self.notes)))

    def test_duplicate_identity_is_rejected(self):
        self.notes["memory/Handoffs/TRN-01"]["fields"]["id"] = "trn-01"
        self.assertTrue(any("duplicate id" in e for e in memory.validate(self.notes)))

    def test_credential_is_flagged_without_printing_value(self):
        dummy = "AK" + "IA" + "0" * 16
        self.notes["memory/Project"]["text"] += dummy
        errors = memory.validate(self.notes)
        self.assertTrue(any("possible AWS access key" in e for e in errors))
        self.assertFalse(any(dummy in e for e in errors))

    def test_csv_preserves_multiline_acceptance_and_unique_import_ids(self):
        generated = memory.outputs(self.notes)
        rows = list(csv.DictReader(io.StringIO(generated["jira-import.csv"])))
        self.assertEqual(len(rows), 32)
        self.assertEqual(len({row["Issue ID"] for row in rows}), len(rows))
        verifier = next(row for row in rows if row["Issue ID"] == "11")
        self.assertIn("## Acceptance criteria\n", verifier["Description"])
        self.assertIn("Parse emitted text independently", verifier["Description"])
        self.assertIn("FR-13", verifier["Description"])
        self.assertIn("NOT RUN", verifier["Description"])
        self.assertEqual(generated, memory.outputs(self.notes))


if __name__ == "__main__":
    unittest.main()
