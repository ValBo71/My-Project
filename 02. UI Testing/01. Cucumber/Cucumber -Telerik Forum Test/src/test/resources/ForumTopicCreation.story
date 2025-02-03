Meta:
@forumTopicCreation

Narrative:
As a registered forum user
I would like to create a new topic
So that I can receive help or have a discussion with the forum community

Scenario: 001 Create a new topic with valid title and description
Given user is logged in topic creation button is visible
When new topic button is clicked
And JBehave BDD Test is entered in title field
And JBehave BDD Test is entered in description field
And create topic button is clicked
Then the new topic is posted
And the reply to topic button is visible

Scenario: 002 System prevents user from creating a new topic with empty title and description
Given user is logged in topic creation button is visible
When new topic button is clicked
And create topic button is clicked
Then title validation pop up is triggered
And description validation pop up is triggered