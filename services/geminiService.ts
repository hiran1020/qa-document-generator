
import { GoogleGenAI, Type, File as GoogleFile } from "@google/genai";
import { GeneratedDocuments, InputContentPart } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        testPlan: {
            type: Type.STRING,
            description: "A highly detailed and professional test plan in Markdown format, written with the authority of a principal engineer. It MUST include the following sections, all populated with specific, actionable information derived *only* from the provided media: 1. **Introduction**: Briefly describe the feature's purpose and its intended audience. 2. **Scope**: Clearly define **In-Scope** and **Out-of-Scope** functionality. 3. **Test Strategy**: Detail the testing approach, including rationale for the chosen levels (Unit, Integration, System, UAT) and types (Functional, UI/UX, Performance, Security). 4. **Success Criteria**: Define clear, quantifiable metrics for success (e.g., '95% of test cases passed', 'Zero P0 bugs found'). 5. **Test Environment**: Specify the required hardware, software, and configurations. 6. **Test Deliverables**: List all documents to be produced. 7. **Resources & Responsibilities**: Suggest roles (e.g., QA Lead, Test Engineers). 8. **Risks & Mitigation**: Identify at least 3 specific project risks. You MUST format this section as a point-based list, NOT a table. For each risk, create a single bullet point that includes the risk description, probability, impact, and mitigation strategy, using bold labels. Example: `- **Risk:** Inaccurate data parsing. **Probability:** Medium. **Impact:** High. **Mitigation Strategy:** Implement a manual review of all generated documents.` Avoid generic risks.",
        },
        qaDocument: {
            type: Type.STRING,
            description: "A formal QA Document in Markdown format. It MUST cover: 1. **Quality Objectives**: Define clear, measurable quality goals (e.g., 'Achieve a user satisfaction score of 8/10'). 2. **Key Quality Attributes**: Analyze and describe how the feature addresses attributes like **Performance** (e.g., 'API response time <250ms under X load'), **Security** (e.g., 'Checks for input sanitization to prevent XSS'), **Usability**, **Reliability**, and **Maintainability**. 3. **Testing Process**: Detail the end-to-end testing workflow. 4. **Defect Management**: Describe the bug lifecycle, including severity/priority definitions and the process for tracking and closure.",
        },
        featureManual: {
            type: Type.STRING,
            description: "A comprehensive, user-friendly feature manual in Markdown format for a non-technical audience. It must be exceptionally clear and well-structured, and include: 1. **Table of Contents**. 2. **Getting Started**: Step-by-step setup. 3. **Core Functionality**: Guides for all primary use cases. **Include placeholders for screenshots where visual explanation is critical**, formatted like this: `[Screenshot: The user dashboard after login]`. 4. **Advanced Features**: Detail any secondary functionalities. 5. **Troubleshooting / FAQ**: List potential problems and provide simple, clear solutions.",
        },
        testCases: {
            type: Type.ARRAY,
            description: "Generate an exhaustive list of at least 50 - 150 highly detailed based on the requirement test cases covering all aspects of the feature: Positive Scenarios, Negative Scenarios, Edge Cases, and UI/UX Tests. For each test case, assign a priority (High, Medium, Low) based on its criticality to the feature's core function.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier for the test case, e.g., 'TC-FUNC-001'." },
                    priority: { type: Type.STRING, description: "The priority of the test case.", enum: ['High', 'Medium', 'Low'] },
                    preConditions: { type: Type.ARRAY, description: "An array of strings describing the state required before starting the test, e.g., 'User is logged in'.", items: { type: Type.STRING } },
                    description: { type: Type.STRING, description: "A brief, clear description of the test case's objective." },
                    steps: { type: Type.ARRAY, description: "A detailed, numbered array of strings of actions to execute the test.", items: { type: Type.STRING } },
                    expectedResult: { type: Type.STRING, description: "A clear, specific description of the expected outcome." }
                },
                required: ["id", "priority", "preConditions", "description", "steps", "expectedResult"],
            },
        },
        userStories: {
            type: Type.ARRAY,
            description: "A list of well-defined user stories derived directly from the feature's purpose. For each story, provide detailed acceptance criteria that clearly define the requirements.",
            items: {
                type: Type.OBJECT,
                properties: {
                    story: { type: Type.STRING, description: "The user story in the format 'As a [user type], I want [to do something] so that [I can achieve some goal].'" },
                    acceptanceCriteria: { type: Type.ARRAY, description: "A list of specific, testable acceptance criteria, ideally using Gherkin syntax (Given/When/Then).", items: { type: Type.STRING } },
                
                },
                 required: ["story", "acceptanceCriteria" ],
            }
        },
        smokeTestSuite: {
            type: Type.STRING,
            description: "A comprehensive smoke test suite document in Markdown format that focuses on critical path validation and quick build verification. It MUST include: 1. **Overview**: Brief description of the smoke testing purpose and scope for this feature. 2. **Critical Path Scenarios**: Identify the most important user journeys and core functionality that must work for the application to be considered functional. 3. **Quick Build Verification Tests**: List of automated and manual tests that can be executed quickly (under 30 minutes) to verify basic functionality after each build. 4. **Pre-deployment Sanity Checks**: Essential validation steps that must pass before any deployment to production, including environment checks, core API validations, and basic UI functionality. 5. **Test Execution Guidelines**: Clear instructions on when to run smoke tests, expected execution time, and pass/fail criteria. 6. **Automation Priorities**: Recommendations for which smoke tests should be automated first, including rationale and technical considerations. 7. **Failure Response Protocol**: Steps to take when smoke tests fail, including rollback procedures and escalation paths.",
        },
        regressionTestPlan: {
            type: Type.STRING,
            description: "A detailed regression test plan in Markdown format that ensures existing functionality remains intact. It MUST include: 1. **Regression Testing Strategy**: Define the overall approach to regression testing for this feature, including frequency, scope, and integration with the development cycle. 2. **Impact Analysis Methodology**: Detailed process for analyzing code changes and determining which areas of the application might be affected, including dependency mapping and risk assessment techniques. 3. **Test Selection Criteria**: Clear guidelines for selecting which existing test cases to include in regression suites based on risk, coverage, and change impact. Include criteria for full regression vs. selective regression testing. 4. **Test Suite Organization**: Structure regression tests into logical groups (e.g., critical path, feature-specific, integration, UI) with clear prioritization. 5. **Automation Strategy**: Comprehensive plan for automating regression tests, including tool recommendations, maintenance strategies, and coverage goals. 6. **Release Validation Strategy**: Step-by-step process for validating releases using regression testing, including entry/exit criteria, sign-off procedures, and quality gates. 7. **Risk Mitigation**: Identify potential risks in regression testing and mitigation strategies, such as test environment issues, data dependencies, and timing constraints.",
        },
    },
    required: ["testPlan", "qaDocument", "featureManual", "testCases", "userStories", "smokeTestSuite", "regressionTestPlan"],
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Uploads a file to the Gemini File API and waits for it to be processed.
 * This streams the file and polls for its status to ensure it's ready for use,
 * which is crucial for large files like videos.
 * @param file The file to upload.
 * @returns A promise that resolves to the active file's metadata.
 */
const uploadFile = async (file: File): Promise<GoogleFile> => {
    if (!ai.files) {
        throw new Error("File API is not available on the 'ai' instance. Check your SDK version.");
    }
    
    // 1. Upload the file
    console.log(`Starting upload for: ${file.name}`);
    const uploadResult = await ai.files.upload({
        file: file,
    });
    
    let processingFile = uploadResult;
    console.log(`Upload initiated for ${processingFile.name}. Initial state: ${processingFile.state}`);

    // 2. Poll for the file's state to become ACTIVE. Videos can take a while to process.
    while (processingFile.state === 'PROCESSING') {
        console.log(`File is still processing. Waiting 3 seconds...`);
        await delay(3000); 

        // Get the latest file status
        const getFileResult = await ai.files.get({ name: processingFile.name });
        processingFile = getFileResult;
        console.log(`Current file state: ${processingFile.state}`);
    }

    if (processingFile.state === 'FAILED') {
        const failureReason = processingFile.error?.message || 'Unknown reason';
        throw new Error(`File processing failed for ${file.name}: ${failureReason}`);
    }

    if (processingFile.state !== 'ACTIVE') {
        // This is a fallback, but the loop should handle the main states.
        throw new Error(`File ${file.name} did not become ACTIVE. Current state: ${processingFile.state}`);
    }
    
    // It can take a few seconds for the file to be usable after it becomes ACTIVE.
    // Add a conservative delay to mitigate potential race conditions with backend propagation.
    console.log(`File is ACTIVE. Waiting 5 seconds for propagation.`);
    await delay(5000);

    console.log(`File ${processingFile.name} is now ready to use.`);
    return processingFile;
};


export const generateDocuments = async (contentParts: InputContentPart[], videoFile: File | null, previousDocuments: GeneratedDocuments | null = null): Promise<GeneratedDocuments> => {
    if (contentParts.length === 0 && !videoFile) {
        throw new Error("Cannot generate documents without a description or a video file.");
    }

    try {
        let prompt: string;
        const criticalPrompt = `**CRITICAL: Your entire response MUST be a single, valid JSON object. Do not add any text outside the JSON. All strings, especially those with Markdown, must have internal double quotes escaped like this: \\". An invalid JSON response will cause a system failure.**`;
        
        const textDescription = contentParts
            .filter((p): p is { type: 'text'; content: string } => p.type === 'text')
            .map(p => p.content).join('');

        if (previousDocuments) {
            // This is a subsequent call for a video chunk.
            prompt = `You are updating a suite of QA documents based on a new video segment. I have already processed previous parts of the video, and here is the documentation generated so far in JSON format:

--- PREVIOUS DOCUMENTS (JSON) ---
${JSON.stringify(previousDocuments)}
--- END PREVIOUS DOCUMENTS ---

Now, analyze this new video segment. Your task is to intelligently merge, update, and extend the previous documentation with new information found in this segment.

**IMPORTANT RULES:**
1.  **DO NOT DUPLICATE:** Avoid adding test cases, user stories, or feature descriptions that are already covered in the previous documents.
2.  **MERGE & REFINE:** If the new video provides more detail on an existing feature, refine the existing descriptions, steps, or criteria rather than adding a new item.
3.  **EXTEND:** Add new test plans, test cases, stories, etc., only for *new* functionality revealed in this video segment.
4.  **MAINTAIN FORMAT:** The final output must be a single, consolidated JSON object that adheres to the provided schema.

${criticalPrompt}`;
        } else {
            // This is the first call.
            prompt = `As an expert QA engineer and technical writer, analyze the provided media to generate a comprehensive, professional-grade suite of QA documents. Your output must be a JSON object matching the provided schema.

${criticalPrompt}

The documents must be exceptionally detailed, specific, and tailored to the feature presented. Avoid all generic, boilerplate, or placeholder text. Base every part of your response on the concrete details you can extract from the provided media.`;
            
            const hasVideo = !!videoFile;
            const hasText = textDescription.trim().length > 0;
            const hasImages = contentParts.some(p => p.type === 'image');

            if (hasVideo && (hasText || hasImages)) {
                prompt += `\n\nYou must synthesize information from *all* attached media: the video, the text description, and any inline images. A comprehensive analysis requires using all sources equally.\n\n--- TEXT DESCRIPTION ---\n${textDescription.trim()}`;
            } else if (hasVideo) {
                prompt += `\n\nThe sole source of information is the attached video. Analyze it carefully to understand the feature's functionality, UI, and user flows.`;
            } else { // Text and/or images, no video
                prompt += `\n\nThe source of information is the following text description and any accompanying images. Analyze them carefully.\n\n--- TEXT DESCRIPTION ---\n${textDescription.trim()}`;
            }
        }
        
        const apiParts: any[] = [{ text: prompt }];

        // Add pasted images to the parts
        contentParts.forEach(part => {
            if (part.type === 'image') {
                apiParts.push({
                    inlineData: {
                        mimeType: part.mimeType,
                        data: part.base64Data,
                    }
                });
            }
        });
        
        if (videoFile) {
            const uploadedFile = await uploadFile(videoFile);
            apiParts.push({
                fileData: {
                    mimeType: uploadedFile.mimeType,
                    fileUri: uploadedFile.uri,
                }
            });
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: apiParts },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
                maxOutputTokens: 32768,
                thinkingConfig: {
                    thinkingBudget: 2048,
                },
            },
        });

        const rawText = response.text.trim();
        if (!rawText) {
            throw new Error("The AI returned an empty response. Please try again.");
        }
        
        const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonText = jsonMatch ? jsonMatch[1].trim() : rawText;

        try {
            const parsedJson = JSON.parse(jsonText);
        
            if (!parsedJson.testPlan || !parsedJson.testCases || !parsedJson.userStories || !parsedJson.smokeTestSuite || !parsedJson.regressionTestPlan) {
                throw new Error("AI response is missing required fields.");
            }

            return parsedJson as GeneratedDocuments;
        } catch (e: any) {
             console.error("Failed to parse JSON response from Gemini. The raw text was:", jsonText);
             throw new Error(`The AI returned a malformed JSON response: ${e.message}`);
        }
    } catch (error: any) {
        console.error("Error generating documents with Gemini:", error);
        
        let errorMessage = "The AI failed to generate the documents. Please check your input and try again.";

        if (error.message) {
            if (error.message.includes('File processing failed')) {
                errorMessage = error.message;
            } else if (error.message.toLowerCase().includes('json')) {
                 errorMessage = "The AI returned an invalid format. Please try again.";
            } else if (error.message.includes('upload') || error.message.includes('File API')) {
                errorMessage = "Failed to communicate with the AI file service. Please check your network and try again.";
            } else if (error.message.includes('Unsupported file uri')) {
                errorMessage = "The AI service could not access the uploaded video. This can be an intermittent issue. Please try again.";
            } else if (error.message.includes('required fields')) {
                errorMessage = "The AI response was missing required sections. Please try again."
            }
        } 
        
        const nestedError = error.error;
        if (nestedError && nestedError.message) {
             errorMessage = nestedError.message;
        }

        if (nestedError && nestedError.code >= 500) {
            errorMessage = "The AI service is currently unavailable or experiencing issues. Please try again later.";
        }

        throw new Error(errorMessage);
    }
};
