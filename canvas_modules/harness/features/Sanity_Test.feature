Feature: Canvas sanity test

  As a human
  I want to create a canvas
  So I can build a graph
@watch
  Scenario: Sanity test empty canvas
    Given I am on the test harness
    Given I have toggled the app side panel
    Given I have uploaded palette "test_resources/palettes/modelerPalette.json"
		Given I have toggled the app side panel

    Then I add node 1 a "Var. File" node from the "Import" category onto the canvas at 100, 200
    Then I add node 2 a "Derive" node from the "Field Ops" category onto the canvas at 200, 200
    Then I link node 1 the "Var. File" node to node 2 the "Derive" node for link 1 on the canvas
    Then I select node 2 the "Derive" node
    Then I add comment 1 at location 100, 250 with the text "This comment box should be linked to the derive node."
    Then I add node 3 a "Filter" node from the "Field Ops" category onto the canvas at 300, 200
    Then I link node 2 the "Derive" node to node 3 the "Filter" node for link 3 on the canvas
    Then I add node 4 a "Type" node from the "Field Ops" category onto the canvas at 400, 200
    Then I link node 3 the "Filter" node to node 4 the "Type" node for link 4 on the canvas
    Then I add node 5 a "C5.0" node from the "Modeling" category onto the canvas at 500, 100
    Then I add node 6 a "Neural Net" node from the "Modeling" category onto the canvas at 500, 300
    Then I link node 4 the "Type" node to node 5 the "C5.0" node for link 5 on the canvas
    # this next test case fails because of issue #109
    #Then I link node 4 the "Type" node to node 6 the "Neural Net" node for link 6 on the canvas
    Then I select node 4 the "Type" node
    Then I add comment 2 at location 350, 350 with the text "this comment box should be linked to the type node"
    Then I link comment 2 to node 6 the "Neural Net" node for link 7 on the canvas
    Then I add comment 3 at location 550, 150 with the text "This is the functional test canvas that we build through automated test cases.  This comment is meant to simulate a typical comment for annotating the entire canvas."

    # Now delete everything and go back to empty canvas

    Then I delete node 1 the "Var. File" node
    Then I validate there are 6 links on the canvas
    Then I delete comment link at 170, 200 between comment 1 and node 1 the "Derive" node
    Then I validate there are 5 links on the canvas
    Then I delete node 1 the "Derive" node
    Then I validate there are 4 links on the canvas
    Then I delete comment 1 linked to the "Derive" node with the comment text "This comment box should be linked to the derive node."
    Then I delete node link at 335, 188 between node 1 the "Filter" node and node 2 the "Type" node
    Then I validate there are 3 links on the canvas
    Then I delete node 1 the "Filter" node
    Then I delete comment 1 linked to the "Type" node with the comment text "this comment box should be linked to the type node"
    # defect 111 prevents link from being deleted and the following to fail.  There should be 1 link left after this.
    #Then I validate there are 3 links on the canvas
    Then I delete node 1 the "Type" node
    # see defect 111 about, this should be 0 links
    #Then I validate there are 0 links on the canvas
    Then I delete node 1 the "C5.0" node
    Then I delete node 1 the "Neural Net" node
    Then I delete comment 1 linked to the "Canvas" node with the comment text "This is the functional test canvas that we build through automated test cases.  This comment is meant to simulate a typical comment for annotating the entire canvas."

    # Verify that the diagram.json has no content.
    Then I expect the object model to be empty
