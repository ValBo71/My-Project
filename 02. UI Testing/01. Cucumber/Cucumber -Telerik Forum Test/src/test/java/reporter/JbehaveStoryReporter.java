package reporter;

import com.telerikacademy.forumframework.Utils;
import org.apache.logging.log4j.Logger;
import org.jbehave.core.model.*;
import org.jbehave.core.reporters.StoryReporter;
import org.jbehave.core.steps.StepCollector;

import java.util.List;
import java.util.Map;

public class JbehaveStoryReporter implements StoryReporter{
        private static final String SEPARATOR = "\n-------------------------------------------------------\n";
        public static final Logger logger = Utils.LOG;

        private String currentStory;
        private String currentScenario;
        private String currentStep;


    @Override
    public void beforeScenario(String scenarioTitle) {
        logger.debug("BeforeScenario: " +scenarioTitle);
    }
        @Override
        public void storyNotAllowed(Story story, String filter) {
            logger.debug("Story: " +story.getName() + " with filter: "+ filter + " not allowed!");

        }

        @Override
        public void storyCancelled(Story story, StoryDuration storyDuration) {
            logger.debug("Story: " + story.getName() +" is cancelled after "
                    + storyDuration.getDurationInSecs() + "sec !");

        }

        @Override
        public void beforeStory(Story story, boolean givenStory) {
            if(story != null){
                this.currentStory = story.getName();

                print(SEPARATOR + "Executing story : " + story.getName() + SEPARATOR);
            }
        }

        @Override
        public void afterStory(boolean givenOrRestartingStory) {
            logger.debug("Executing after story ... ");

        }

        @Override
        public void narrative(Narrative narrative) {
            logger.debug("Executing narrative ... ");

        }

        @Override
        public void lifecyle(Lifecycle lifecycle) {
            logger.debug("Executing lifecycle ...");

        }

    @Override
    public void beforeStorySteps(StepCollector.Stage stage) {

    }

    @Override
    public void afterStorySteps(StepCollector.Stage stage) {

    }

    @Override
    public void beforeScenarioSteps(StepCollector.Stage stage) {

    }

    @Override
    public void afterScenarioSteps(StepCollector.Stage stage) {

    }

    @Override
        public void scenarioNotAllowed(Scenario scenario, String filter) {
            logger.debug("Scenario: " +scenario.getTitle() + " with filter: "+ filter + " not allowed!");

        }

    @Override
    public void beforeScenario(Scenario scenario) {

    }


    @Override
        public void scenarioMeta(Meta meta) {
            logger.debug("Executing scenario metadata ...");

        }

        @Override
        public void afterScenario() {
            logger.debug("Executing after scenario ...");

        }

    @Override
    public void beforeGivenStories() {

    }

    @Override
        public void givenStories(GivenStories givenStories) {
            logger.debug("Executing given stories ...");

        }

        @Override
        public void givenStories(List<String> storyPaths) {
            logger.debug("Executing given stories path");

        }

    @Override
    public void afterGivenStories() {

    }


    @Override
        public void beforeExamples(List<String> steps, ExamplesTable table) {
            logger.debug("Executing before examples ...");

        }

        @Override
        public void example(Map<String, String> tableRow) {
            logger.debug("Executing examples ...");

        }

    @Override
    public void example(Map<String, String> map, int i) {

    }

    @Override
        public void afterExamples() {
            logger.debug("Executing after examples ...");

        }

        @Override
        public void beforeStep(String step) {
            this.currentStep = step;
            print("Executing step : " + step);

        }

        @Override
        public void successful(String step) {
            print("SUCCESSFUL STEP : " + step);

        }

        @Override
        public void ignorable(String step) {
            print("IGNORED STEP : " + step);

        }

    @Override
    public void comment(String s) {

    }

    @Override
        public void pending(String step) {
            print("PENDING STEP : " + step);

        }

        @Override
        public void notPerformed(String step) {
            logger.debug(step + "not performed! ");

        }

        @Override
        public void failed(String step, Throwable cause) {
            print(SEPARATOR + "FAILED STEP : " + step + SEPARATOR);
            print("REASON: " + (((cause != null) && (cause.getCause() != null))  ?  cause.getCause().getMessage() : ""));
        }

        @Override
        public void failedOutcomes(String step, OutcomesTable table) {
            logger.debug("Failed outcomes on step: " + step);

        }

        @Override
        public void restarted(String step, Throwable cause) {
            logger.debug("Restarted step: " + step);

        }

        @Override
        public void restartedStory(Story story, Throwable cause) {
            logger.debug("Restarted story: " + story);

        }

        @Override
        public void dryRun() {
            logger.debug("Dry Run");

        }

        @Override
        public void pendingMethods(List<String> methods) {
            logger.debug("Pending methods ...");

        }

        /**
         *  Print message to log file
         * @param message
         */
        public void print(String message){
            logger.info(message);
        }
}
