from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import FaithfulnessMetric, AnswerRelevancyMetric

# This mimics your InterviewService
def test_name_recognition():
    input_text = "Hi, my name is Raheem."
    actual_output = interview_service.generate_response(input_text)
    
    metric = FaithfulnessMetric(threshold=0.7)
    
    test_case = LLMTestCase(
        input=input_text,
        actual_output=actual_output,
        retrieval_context=["Candidate name is Zayeem"] 
    )

    assert_test(test_case, [metric])