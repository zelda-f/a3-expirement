library(dplyr)
library(stringr)
library(ggplot2)

data <- read.csv("data_analysis/data_1.csv")
# drop participantTags rows
data <- data[!(data$trialId %in% "participantTags"), ]
# clean data split answer row at the comma
# then divide the answer into correct and participant answer

data$answer <- str_split(data$answer, ",")

data$correct_answer <- sapply(data$answer, function(x) x[2])
data$participant_answer <- sapply(data$answer, function(x) x[1])

data$correct <- data$correct_answer == data$participant_answer

print(head(data))
# find the accuracy of each condition
accuracy <- data %>%
  group_by(trialId) %>%
  summarise(accuracy = mean(correct))

print(accuracy)

# find the response time of each condition
response_time <- data %>%
  group_by(trialId) %>%
  summarise(response_time = mean(as.numeric(duration)))

print(response_time)

# run anovas on accuracy and response time
accuracy_anova <- aov(correct ~ trialId, data = data)
print(summary(accuracy_anova))

response_time_anova <- aov(duration ~ trialId, data = data)
print(summary(response_time_anova))

# generate predictive models of accuracy and response time controling for
# conditions

accuracy_model <- glm(correct ~ trialId, data = data, family = "binomial")
print(summary(accuracy_model))

# generate plots of the data and analysis results:
# boxplots for descriptive statistics
# bar plots for the models
# tables for the anovas and descriptive statistics

boxplot_rt = ggplot(data, aes(x = trialId, y = duration)) +
  geom_boxplot() +
  labs(title = "Response Time Boxplot", x = "Condition", y = "Response Time")

barplot_accuracy = ggplot(accuracy, aes(x = trialId, y = accuracy))
