"""Unit pins for the wikitext transforms in 02_extract — this session's bug graveyard."""

from conftest import load_stage

extract = load_stage("02_extract")


class TestStripWikitext:
    def test_nested_templates_vanish(self):
        assert extract.strip_wikitext("A {{cite web|title={{ill|X}}}} B") == "A B"

    def test_file_links_go_whole_with_their_thumb_noise(self):
        # the shipped-description bug: raw "thumb|" must never survive
        text = "Intro. [[File:Pho.jpg|thumb|left|200px|A bowl]] More prose."
        assert extract.strip_wikitext(text) == "Intro. More prose."

    def test_image_prefix_is_case_insensitive(self):
        assert extract.strip_wikitext("[[image:X.jpg|thumb]] Prose.") == "Prose."

    def test_links_reduce_to_display_text(self):
        assert extract.strip_wikitext("[[Pho|phở]] is a [[Vietnam|Vietnamese]] soup") == (
            "phở is a Vietnamese soup"
        )

    def test_refs_bold_and_tags_are_removed(self):
        text = "'''Soto''' is a soup<ref name=a/> from <ref>b</ref>Java, Indonesia."
        assert extract.strip_wikitext(text) == "Soto is a soup from Java, Indonesia."

    def test_paren_husks_left_by_removed_templates(self):
        # the husk rule matches the bare function word; punctuation inside survives
        assert extract.strip_wikitext("Soup (, literally) is hot") == "Soup is hot"
        assert extract.strip_wikitext("Soup (from ) is hot") == "Soup is hot"
        assert extract.strip_wikitext("Gumbo ( ; . ) is hot") == "Gumbo is hot"


class TestSplitParams:
    def test_splits_top_level_pipes_only(self):
        # note: the template's own closing braces ride in the final chunk — pinned
        # as-is; parse_infobox's field regex is indifferent to them
        box = "{{Infobox food | name = A | country = {{ubl|X|Y}} }}"
        assert extract.split_params(box) == [
            "{{Infobox food ",
            " name = A ",
            " country = {{ubl|X|Y}} }}",
        ]

    def test_link_pipes_do_not_split(self):
        box = "{{Infobox food | image = [[File:A.jpg|thumb]] | name = A}}"
        assert extract.split_params(box)[1] == " image = [[File:A.jpg|thumb]] "

    def test_own_braces_do_not_open_a_depth_level(self):
        # the original bug: depth started at 0 and the template's own '{{' kept it at 1,
        # so no param ever split
        box = "{{Infobox food | name = A}}"
        assert extract.split_params(box) == ["{{Infobox food ", " name = A}}"]


class TestLeadPhoto:
    def test_first_bare_file_link(self):
        assert extract.lead_photo("Text [[File:Pho.jpg|thumb]] more") == "Pho.jpg"

    def test_none_when_absent(self):
        assert extract.lead_photo("Just prose, no image.") == ""


def test_clean_name_strips_dish_qualifiers():
    assert extract.clean_name("Goulash (soup)") == "Goulash"
    assert extract.clean_name("Pho (noodle soup)") == "Pho"
    assert extract.clean_name("Bisque") == "Bisque"
